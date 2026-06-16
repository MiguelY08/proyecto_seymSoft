import apiClient from "../../../../../setting/apiClient.js";

// ─────────────────────────────────────────────
// OBTENER DASHBOARD DE INDICADORES
// ─────────────────────────────────────────────

export const getDashboardIndicators = async () => {
  try {
    const response =
      await apiClient.get(
        "/indicators/dashboard"
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