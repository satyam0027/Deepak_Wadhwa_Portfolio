/**
 * Data loader — pages call DW.loadPageData(keys) to hydrate from JSON.
 * Uses a small in-memory cache so Home's multiple keys don't re-fetch on revisit.
 */
window.DW = window.DW || {};

DW._dataCache = DW._dataCache || Object.create(null);

DW.fetchData = async function fetchData(name) {
  if (DW._dataCache[name]) return DW._dataCache[name];
  const res = await fetch(`${DW.config.dataPath}/${name}.json`, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to load data/${name}.json`);
  const data = await res.json();
  DW._dataCache[name] = data;
  return data;
};

DW.loadPageData = async function loadPageData(keys) {
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const data = await DW.fetchData(key);
        return [key, data];
      } catch (err) {
        console.warn(`[DW] ${err.message}`);
        return [key, null];
      }
    })
  );
  return Object.fromEntries(entries);
};
