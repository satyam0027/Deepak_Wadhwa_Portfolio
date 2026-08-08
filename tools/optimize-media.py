"""
Optimize site images (WebP) and videos (H.264).
Run: python tools/optimize-media.py
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

# Max width by path fragment
IMAGE_RULES = [
    ("portrait", 720, 82),
    ("programs", 960, 78),
    ("resources", 960, 78),
    ("articles", 960, 78),
    ("images", 1200, 80),
]


def pillow_ok():
    from PIL import Image  # noqa: F401

    return True


def ffmpeg_exe() -> str | None:
    which = shutil.which("ffmpeg")
    if which:
        return which
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def rule_for(path: Path) -> tuple[int, int]:
    s = str(path).replace("\\", "/").lower()
    for key, w, q in IMAGE_RULES:
        if key in s:
            return w, q
    return 1200, 80


def optimize_image(src: Path) -> Path | None:
    from PIL import Image, ImageOps

    if src.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
        return None
    if src.name.startswith("."):
        return None

    max_w, quality = rule_for(src)
    out = src.with_suffix(".webp")

    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode in ("P", "RGBA", "LA"):
            # Preserve alpha for portraits / soft edges
            if im.mode != "RGBA":
                im = im.convert("RGBA")
        else:
            im = im.convert("RGB")

        w, h = im.size
        if w > max_w:
            nh = int(h * (max_w / w))
            im = im.resize((max_w, nh), Image.Resampling.LANCZOS)

        save_kw = {"format": "WEBP", "quality": quality, "method": 6}
        if im.mode == "RGBA":
            save_kw["lossless"] = False
        im.save(out, **save_kw)

    # Remove original raster if webp is smaller (keep if webp somehow larger)
    if out.exists() and src.suffix.lower() != ".webp":
        if out.stat().st_size < src.stat().st_size or src.suffix.lower() == ".png":
            # Prefer webp; delete bulky png/jpg originals after success
            try:
                src.unlink()
            except OSError:
                pass
    return out


def optimize_video(src: Path, ff: str) -> Path | None:
    if src.suffix.lower() not in {".mp4", ".mov", ".webm"}:
        return None

    tmp = src.with_name(src.stem + ".opt.mp4")
    # 720p, muted-friendly bg loops: CRF 28, faststart, no audio
    cmd = [
        ff,
        "-y",
        "-i",
        str(src),
        "-vf",
        "scale='min(1280,iw)':-2",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "28",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        str(tmp),
    ]
    print("  ffmpeg:", " ".join(cmd[-8:]), "...")
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    if not tmp.exists():
        return None

    # Replace original if smaller
    if tmp.stat().st_size < src.stat().st_size:
        src.unlink()
        tmp.rename(src)
        return src

    # Keep smaller of the two
    if tmp.stat().st_size >= src.stat().st_size:
        tmp.unlink()
        print("  kept original (already smaller)")
        return src

    return src


def rewrite_refs():
    """Point JSON/JS image refs from .png/.jpg to .webp when webp exists."""
    replacements = []
    for img in (ASSETS / "images").rglob("*"):
        if img.suffix.lower() != ".webp":
            continue
        for ext in (".png", ".jpg", ".jpeg"):
            old = img.with_suffix(ext)
            # reference paths use forward slashes from site root
            old_ref = "/" + old.relative_to(ROOT).as_posix()
            new_ref = "/" + img.relative_to(ROOT).as_posix()
            # also without leading slash / relative
            replacements.append((old_ref, new_ref))
            replacements.append((old_ref.lstrip("/"), new_ref.lstrip("/")))
            replacements.append((str(old.relative_to(ROOT)).replace("\\", "/"), str(img.relative_to(ROOT)).replace("\\", "/")))

    targets = list((ROOT / "data").glob("*.json"))
    targets += list((ROOT / "js").rglob("*.js"))
    # dedupe replacements
    seen = set()
    uniq = []
    for a, b in replacements:
        if a == b or (a, b) in seen:
            continue
        seen.add((a, b))
        uniq.append((a, b))

    for path in targets:
        text = path.read_text(encoding="utf-8")
        orig = text
        for a, b in uniq:
            text = text.replace(a, b)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            print(f"  updated refs: {path.relative_to(ROOT)}")


def main():
    print("Root:", ROOT)
    pillow_ok()
    ff = ffmpeg_exe()
    print("ffmpeg:", ff or "NOT FOUND")

    images = [
        p
        for p in (ASSETS / "images").rglob("*")
        if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
    ]
    print(f"\nImages ({len(images)}):")
    before_img = sum(p.stat().st_size for p in images)
    for p in images:
        before = p.stat().st_size
        out = optimize_image(p)
        if out and out.exists():
            after = out.stat().st_size
            print(f"  {p.name}: {before/1024:.1f}KB -> {out.name} {after/1024:.1f}KB")

    videos = [
        p
        for p in (ASSETS / "videos").rglob("*")
        if p.is_file() and p.suffix.lower() in {".mp4", ".mov", ".webm"}
    ]
    print(f"\nVideos ({len(videos)}):")
    before_vid = sum(p.stat().st_size for p in videos)
    if ff:
        for p in videos:
            before = p.stat().st_size
            print(f"  compressing {p.name} ({before/1024/1024:.1f}MB)...")
            try:
                optimize_video(p, ff)
                after = p.stat().st_size
                print(f"  {p.name}: {before/1024/1024:.2f}MB -> {after/1024/1024:.2f}MB")
            except subprocess.CalledProcessError as e:
                print(f"  FAILED {p.name}: {e}")
    else:
        print("  skip — no ffmpeg")

    print("\nRewriting references to .webp...")
    rewrite_refs()

    images_after = list((ASSETS / "images").rglob("*.webp")) + list((ASSETS / "images").rglob("*.png")) + list((ASSETS / "images").rglob("*.jpg"))
    videos_after = list((ASSETS / "videos").rglob("*.mp4"))
    after_img = sum(p.stat().st_size for p in images_after if p.is_file())
    after_vid = sum(p.stat().st_size for p in videos_after if p.is_file())
    print(f"\nImages total: {before_img/1024:.1f}KB -> {after_img/1024:.1f}KB")
    print(f"Videos total: {before_vid/1024/1024:.2f}MB -> {after_vid/1024/1024:.2f}MB")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("ERROR:", e, file=sys.stderr)
        raise
