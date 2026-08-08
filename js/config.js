/**
 * Site-wide config & path helpers.
 * Prefer http://localhost:5500 (or any static server) — root paths and fetch() need a server.
 * DW.root is computed so nested pages resolve assets correctly.
 */
window.DW = window.DW || {};

(function initRoot() {
  const path = (location.pathname || "/").replace(/\\/g, "/");
  const normalized = path.endsWith(".html")
    ? path.replace(/\/[^/]+\.html$/, "/")
    : path.endsWith("/")
      ? path
      : path + "/";
  const parts = normalized.split("/").filter(Boolean);
  DW.root = parts.length ? parts.map(() => "..").join("/") : "";
  DW.url = function url(pathname) {
    const clean = String(pathname || "").replace(/^\//, "");
    if (!DW.root) return "/" + clean;
    return DW.root + "/" + clean;
  };
  DW.asset = DW.url;
})();

DW.config = {
  get dataPath() {
    return DW.url("data");
  },
  brand: {
    name: "Deepak Wadhwa",
    shortName: "DW",
  },
  navPrimary: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about/" },
    { label: "Programs", href: "/programs/" },
    { label: "Success Stories", href: "/success-stories/" },
  ],
  navSecondary: [
    { label: "Resources", href: "/resources/" },
    { label: "Insights", href: "/insights/" },
    { label: "Media", href: "/media/" },
    { label: "Contact", href: "/contact/" },
  ],
  cta: { label: "JOIN / CONNECT", href: "/community/" },
};

DW.fetchData = async function fetchData(name) {
  const res = await fetch(`${DW.config.dataPath}/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load data/${name}.json`);
  return res.json();
};

/** Resolve site hrefs for nested pages (keeps pretty URLs on a server). */
DW.href = function href(path) {
  if (!path || path.startsWith("http") || path.startsWith("#") || path.startsWith("mailto") || path.startsWith("tel")) {
    return path;
  }
  return DW.url(path.replace(/^\//, ""));
};
