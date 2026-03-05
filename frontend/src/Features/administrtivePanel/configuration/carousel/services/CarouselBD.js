// ─── Configuración ────────────────────────────────────────────────────────────
const DB_NAME    = 'CarouselDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// ─── Abrir / inicializar la BD ────────────────────────────────────────────────
const openDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess  = (event) => resolve(event.target.result);
    request.onerror    = (event) => reject(event.target.error);
  });

// ─── Guardar imagen ───────────────────────────────────────────────────────────
// Recibe: id (número), blob (File | Blob)
// Guarda: { id, blob }
export const saveImage = async (id, blob) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readwrite');
    const store   = tx.objectStore(STORE_NAME);
    const request = store.put({ id, blob });

    request.onsuccess = () => resolve();
    request.onerror   = (e) => reject(e.target.error);
  });
};

// ─── Obtener imagen por ID ────────────────────────────────────────────────────
// Retorna: Blob | null
export const getImage = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readonly');
    const store   = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = (e) => resolve(e.target.result?.blob ?? null);
    request.onerror   = (e) => reject(e.target.error);
  });
};

// ─── Obtener todas las imágenes ───────────────────────────────────────────────
// Retorna: [{ id, blob }, ...]
export const getAllImages = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readonly');
    const store   = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (e) => resolve(e.target.result ?? []);
    request.onerror   = (e) => reject(e.target.error);
  });
};

// ─── Eliminar imagen por ID ───────────────────────────────────────────────────
export const deleteImage = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readwrite');
    const store   = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror   = (e) => reject(e.target.error);
  });
};

// ─── Eliminar todas las imágenes ─────────────────────────────────────────────
export const clearAllImages = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readwrite');
    const store   = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror   = (e) => reject(e.target.error);
  });
};