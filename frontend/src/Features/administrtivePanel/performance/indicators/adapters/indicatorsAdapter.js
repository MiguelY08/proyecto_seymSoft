export const adaptIndicatorsDashboard = (
  dashboardData
) => {
  const commercialTrends =
    dashboardData?.commercialTrends?.map((item) => {
      const [year, month] = String(item.month).split("-").map(Number);
      const label = new Intl.DateTimeFormat("es-CO", {
        month: "short",
      })
        .format(new Date(year, month - 1, 1))
        .replace(".", "");

      return {
        month: label.charAt(0).toUpperCase() + label.slice(1),
        sales: Number(item.sales ?? 0),
        purchases: Number(item.purchases ?? 0),
        returns: Number(item.returns ?? 0),
      };
    }) ?? [];

  const rawCategories = dashboardData?.categoryDemand ?? [];
  const totalCategoryUnits = rawCategories.reduce(
    (total, category) => total + Number(category.units ?? 0),
    0
  );

  return {
    monthlySales: {
      currentMonthSales:
        dashboardData?.monthlySales?.currentMonthSales ?? 0,

      previousMonthSales:
        dashboardData?.monthlySales?.previousMonthSales ?? 0,

      growthPercentage:
        dashboardData?.monthlySales?.growthPercentage ?? 0,
    },

    stock: {
      totalUnitsInStock:
        dashboardData?.stock?.totalUnitsInStock ?? 0,
    },

    topProducts: {
      quantity:
        dashboardData?.topProducts?.quantity ?? [],

      price:
        dashboardData?.topProducts?.price ?? [],
    },

    commercialTrends,

    categoryDemand: rawCategories.map((category) => ({
      idCategory: category.idCategory,
      name: category.categoryName,
      units: Number(category.units ?? 0),
      percentage: totalCategoryUnits > 0
        ? (Number(category.units ?? 0) / totalCategoryUnits) * 100
        : 0,
    })),

    topClients:
      dashboardData?.topClients?.map((client) => ({
        idClient: client.idClient,
        name: client.clientName,
        value: Number(client.value ?? 0),
      })) ?? [],

    activeClients: Number(dashboardData?.activeClients ?? 0),

    meta: {
      firstMetricDate: dashboardData?.meta?.firstMetricDate ?? null,
      appliedRange: dashboardData?.meta?.appliedRange ?? null,
    },
  };
};
