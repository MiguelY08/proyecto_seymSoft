import image01 from '../../../../../assets/carrusel/01.png';

// ─── Imagen por defecto ───────────────────────────────────────────────────────
export const DEFAULT_CAROUSEL_IMAGE = image01;
export const DEFAULT_SLIDE_ID       = 0; // ID fijo — nunca colisiona con Date.now()

// ─── Configuración ────────────────────────────────────────────────────────────
const DB_NAME    = 'CarouselDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const META_KEY   = 'pm_carousel';

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

// ─── Sembrar imagen por defecto ───────────────────────────────────────────────
// Se ejecuta una sola vez: si el slide con DEFAULT_SLIDE_ID no existe en
// localStorage, descarga el asset como Blob, lo guarda en IndexedDB y
// añade su metadata a pm_carousel en primera posición.
export const seedDefaultImage = async () => {
  try {
    const stored = localStorage.getItem(META_KEY);
    const meta   = stored ? JSON.parse(stored) : [];
    const exists = meta.some((s) => s.id === DEFAULT_SLIDE_ID);

    if (exists) return; // Ya sembrada — nada que hacer

    // Descargar el asset como Blob para guardarlo en IndexedDB
    const response = await fetch(image01);
    const blob     = await response.blob();
    await saveImage(DEFAULT_SLIDE_ID, blob);

    // Insertar en primera posición y reajustar órdenes del resto
    const newMeta = [
      { id: DEFAULT_SLIDE_ID, nombre: 'Banner principal', orden: 1, activo: true },
      ...meta.map((s) => ({ ...s, orden: s.orden + 1 })),
    ];
    localStorage.setItem(META_KEY, JSON.stringify(newMeta));
  } catch (err) {
    console.error('Error al sembrar imagen por defecto:', err);
  }
};

// ─── Guardar imagen ───────────────────────────────────────────────────────────
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