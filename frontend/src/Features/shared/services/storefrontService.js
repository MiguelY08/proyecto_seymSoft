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
    return (getData(response) || []).map(unwrapProduct);
  },

  async setCartItem(productId, quantity) {
    const response = await apiClient.put(`/storefront/cart/${productId}`, {
      quantity,
    });
    return unwrapProduct(getData(response));
  },

  async removeCartItem(productId) {
    const response = await apiClient.delete(`/storefront/cart/${productId}`);
    return getData(response);
  },

  async clearCart() {
    const response = await apiClient.delete('/storefront/cart');
    return getData(response);
  },

  async mergeCart(items) {
    const response = await apiClient.post('/storefront/cart/merge', {
      items: items.map((item) => ({
        productId: Number(item.id),
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
    });
    return (getData(response) || []).map(unwrapProduct);
  },
};

export default storefrontService;
