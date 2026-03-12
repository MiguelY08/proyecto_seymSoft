// ─── Constantes ───────────────────────────────────────────────────────────────
export const STORAGE_KEY   = 'pm_carousel';
export const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB


// ─── Helpers de localStorage ──────────────────────────────────────────────────
export const loadMeta = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const saveMeta = (slides) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
};