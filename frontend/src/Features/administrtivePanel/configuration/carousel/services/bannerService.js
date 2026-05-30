import apiClient from "../../../../../setting/apiClient.js";

/**
 * Servicio HTTP del módulo Banner
 *
 * Responsabilidades:
 * - Centralizar las peticiones Axios hacia la API REST
 * - Eliminar dependencia de localStorage / IndexedDB
 * - Consumir directamente el backend real
 */

/**
 * Obtener todos los banners
 * GET /api/banners
 */
export const getAllBanners = async () => {
  const { data } = await apiClient.get("/banners");
  return data.data;
};

/**
 * Obtener banners activos
 * GET /api/banners/active
 */
export const getActiveBanners = async () => {
  const { data } = await apiClient.get("/banners/active");
  return data.data;
};

/**
 * Obtener banner por ID
 * GET /api/banners/:id
 */
export const getBannerById = async (id) => {
  const { data } = await apiClient.get(`/banners/${id}`);
  return data.data;
};

/**
 * Crear banner
 * POST /api/banners
 *
 * Campo esperado por el backend:
 * image
 */
export const createBanner = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post("/banners", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data;
};

/**
 * Activar / desactivar banner
 * PATCH /api/banners/:id/status
 *
 * statusId:
 * 1 -> Activo
 * 2 -> Inactivo
 */
export const toggleBannerStatus = async (id, statusId) => {
  const { data } = await apiClient.patch(`/banners/${id}/status`, {
    statusId,
  });

  return data.data;
};

/**
 * Reordenar banners activos
 * PATCH /api/banners/active/reorder
 *
 * Payload esperado:
 * [
 *   { id: 3, disposition: 1 },
 *   { id: 1, disposition: 2 }
 * ]
 */
export const reorderActiveBanners = async (banners) => {
  const { data } = await apiClient.patch("/banners/active/reorder", banners);
  return data.data;
};

/**
 * Eliminar banner
 * DELETE /api/banners/:id
 *
 * Nota:
 * El backend solo permite eliminar banners inactivos.
 */
export const deleteBanner = async (id) => {
  const { data } = await apiClient.delete(`/banners/${id}`);
  return data.data;
};
