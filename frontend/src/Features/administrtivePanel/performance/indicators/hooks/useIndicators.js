import { useCallback, useEffect, useState } from "react";

import { getDashboardIndicators }
  from "../services/indicatorsService.js";

import { adaptIndicatorsDashboard }
  from "../adapters/indicatorsAdapter.js";

export default function useIndicators(filters = {}) {
  const [indicators, setIndicators] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadIndicators =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getDashboardIndicators(filters);

        const adaptedData =
          adaptIndicatorsDashboard(
            response
          );

        setIndicators(
          adaptedData
        );

      } catch (err) {

        console.error(
          "Error loading indicators:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Error al cargar indicadores"
        );

      } finally {

        setLoading(false);
      }
    }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  return {
    indicators,
    loading,
    error,
    reload: loadIndicators,
  };
}
