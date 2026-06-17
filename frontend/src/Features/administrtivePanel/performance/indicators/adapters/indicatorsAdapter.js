export const adaptIndicatorsDashboard = (
  dashboardData
) => {
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
  };
};