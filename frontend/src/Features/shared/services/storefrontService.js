import apiClient from '../../../setting/apiClient.js';

const getData = (response) => response?.data?.data ?? null;

const unwrapProduct = (entry) => {
  const product = entry?.product || entry || {};
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
    items: items.map((entry) => ({
      ...unwrapProduct(entry.product || entry),
      idCartItem: entry.idCartItem,
      barcodeId: entry.barcodeId ?? entry.product?.barcodeId ?? null,
      barcode: entry.barcode ?? entry.product?.barcode ?? null,
      variantName: entry.variantName ?? entry.product?.variantName ?? null,
      variantImageUrl: entry.variantImageUrl ?? entry.product?.variantImageUrl ?? null,
      variantStock: entry.variantStock ?? entry.product?.variantStock ?? null,
      quantity: entry.quantity,
    })),
    changedItem: response.changedItem
      ? {
          ...unwrapProduct(response.changedItem.product || response.changedItem),
          idCartItem: response.changedItem.idCartItem,
          barcodeId: response.changedItem.barcodeId ?? null,
          barcode: response.changedItem.barcode ?? null,
          variantName: response.changedItem.variantName ?? null,
          variantImageUrl: response.changedItem.variantImageUrl ?? null,
          variantStock: response.changedItem.variantStock ?? null,
          quantity: response.changedItem.quantity,
        }
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

  async setCartItem(productId, barcodeId, quantity) {
    const response = await apiClient.put(`/storefront/cart/${productId}`, {
      barcodeId,
      quantity,
    });
    return unwrapCartResponse(getData(response));
  },

  async removeCartItem(productId, barcodeId) {
    const response = await apiClient.delete(`/storefront/cart/${productId}/${barcodeId}`);
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
        barcodeId: Number(item.barcodeId),
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
    });
    return unwrapCartResponse(getData(response));
  },
};

export default storefrontService;
