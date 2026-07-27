import apiClient from '../../../setting/apiClient.js';

const getData = (response) => response?.data?.data ?? null;

const unwrapProduct = (entry) => {
  const product = entry?.product || {};
  return {
    ...product,
    isActive: product.isActive ?? product.status === 'Activo',
    stock: product.totalStock ?? product.stock ?? 0,
    ...(entry?.quantity !== undefined ? { quantity: entry.quantity } : {}),
  };
};

const unwrapCartResponse = (data) => {
  const response = data && typeof data === 'object' ? data : {};
  const items = Array.isArray(response.items) ? response.items : [];

  return {
    ...response,
    items: items.map(unwrapProduct),
    changedItem: response.changedItem
      ? unwrapProduct(response.changedItem)
      : null,
    summary: {
      totalItems: Number(response.summary?.totalItems) || 0,
      distinctItems: Number(response.summary?.distinctItems) || 0,
      isEmpty: Boolean(response.summary?.isEmpty ?? items.length === 0),
    },
  };
};

export const storefrontService = {
  async getFavorites() {
    const response = await apiClient.get('/storefront/favorites');
    return (getData(response) || []).map(unwrapProduct);
  },

  async addFavorite(productId) {
    const response = await apiClient.post(`/storefront/favorites/${productId}`);
    return unwrapProduct(getData(response));
  },

  async removeFavorite(productId) {
    const response = await apiClient.delete(`/storefront/favorites/${productId}`);
    return getData(response);
  },

  async getCart() {
    const response = await apiClient.get('/storefront/cart');
    return unwrapCartResponse(getData(response));
  },

  async setCartItem(productId, quantity) {
    const response = await apiClient.put(`/storefront/cart/${productId}`, {
      quantity,
    });
    return unwrapCartResponse(getData(response));
  },

  async removeCartItem(productId) {
    const response = await apiClient.delete(`/storefront/cart/${productId}`);
    return unwrapCartResponse(getData(response));
  },

  async clearCart() {
    const response = await apiClient.delete('/storefront/cart');
    return unwrapCartResponse(getData(response));
  },

  async mergeCart(items) {
    const response = await apiClient.post('/storefront/cart/merge', {
      items: items.map((item) => ({
        productId: Number(item.id),
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
    });
    return unwrapCartResponse(getData(response));
  },
};

export default storefrontService;
