import apiClient from '../../../setting/apiClient.js';

export const getMySalesReturns = async ({ page = 1, limit = 50 } = {}) => {
  const response = await apiClient.get('/sales-returns/my-returns', {
    params: { page, limit },
  });

  return {
    data: response.data?.data ?? [],
    pagination: response.data?.pagination ?? null,
  };
};

export const getMySalesReturnById = async (id) => {
  const response = await apiClient.get(`/sales-returns/my-returns/${id}`);
  return response.data?.data ?? null;
};

export default {
  getMySalesReturns,
  getMySalesReturnById,
};
