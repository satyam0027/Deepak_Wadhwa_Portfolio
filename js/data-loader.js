/**
 * Data loader — pages call DW.loadPageData(keys) to hydrate from JSON.
 * Step 2/3 components consume the returned objects; markup is not hardcoded per item.
 */
window.DW = window.DW || {};

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
