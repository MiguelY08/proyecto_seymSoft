/**
 * Helpers del módulo Banner / Carousel
 *
 * Responsabilidades:
 * - Adaptar datos del backend al formato que usa el frontend
 * - Evitar que los componentes dependan directamente del modelo de la API
 */

/**
 * Tamaño máximo permitido para carga desde el frontend.
 * Debe coincidir con la validación del backend.
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Mapea un banner recibido desde la API
 * al formato usado por los componentes actuales.
 *
 * Backend:
 * {
 *   id,
 *   imageUrl,
 *   status,
 *   disposition
 * }
 *
 * Frontend:
 * {
 *   id,
 *   nombre,
 *   imageUrl,
 *   activo,
 *   orden
 * }
 */
export const mapBannerFromApi = (banner) => ({
  id: banner.id,
  nombre: `Banner ${banner.id}`,
  imageUrl: banner.imageUrl,
  activo: banner.status?.id === 1,
  orden: banner.disposition ?? 9999,
  status: banner.status,
});

/**
 * Mapea una lista de banners desde la API.
 */
export const mapBannersFromApi = (banners = []) => {
  return banners.map(mapBannerFromApi);
};

/**
 * Construye el payload para reordenar banners activos.
 *
 * Recibe IDs en el nuevo orden:
 * [3, 1, 2]
 *
 * Retorna:
 * [
 *   { id: 3, disposition: 1 },
 *   { id: 1, disposition: 2 },
 *   { id: 2, disposition: 3 }
 * ]
 */
export const buildReorderPayload = (orderedIds = []) => {
  return orderedIds.map((id, index) => ({
    id,
    disposition: index + 1,
  }));
};

/**
 * Obtiene el statusId contrario al actual.
 *
 * Activo  -> Inactivo
 * Inactivo -> Activo
 */
export const getNextStatusId = (isActive) => {
  return isActive ? 2 : 1;
};