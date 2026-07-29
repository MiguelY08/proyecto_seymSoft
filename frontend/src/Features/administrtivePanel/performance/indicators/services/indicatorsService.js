import apiClient from "../../../../../setting/apiClient.js";

// ─────────────────────────────────────────────
// OBTENER DASHBOARD DE INDICADORES
// ─────────────────────────────────────────────

export const getDashboardIndicators = async (filters = {}) => {
  try {
    const response =
      await apiClient.get(
        "/indicators/dashboard",
        {
          params: {
            topMode: "quantity",
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          },
        }
      );

    return response.data?.data;

  } catch (error) {

    console.error(
      "Error en getDashboardIndicators:",
      error
    );

    throw error;
  }
};
