import apiClient from '../../../../../setting/apiClient.js';

export const ProductsService = {
  async list(filters = {}) {
    const response = await apiClient.get('/products', { params: filters });
    return response.data.data || [];
  },

  async findById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data || null;
  },

  async create(data) {
    if (data instanceof FormData) {
      const response = await apiClient.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || null;
    }

    const formData = new FormData();

    formData.append('nombre', data.nombre);
    formData.append('referencia', data.referencia);
    formData.append('precioDetalle', Number(data.precioDetalle));
    formData.append('precioMayorista', Number(data.precioMayorista));
    formData.append('precioColegas', data.precioColegas ? Number(data.precioColegas) : '');
    formData.append('precioPacas', data.precioPacas ? Number(data.precioPacas) : '');
    formData.append('ivaPercentage', data.ivaPercentage || 0);
    formData.append('idUnitMeasure', data.idUnitMeasure || 2);
    formData.append('idCategorie', data.id_category || data.idCategorie || 1);
    formData.append('description', data.descripcion || data.description || '');
    formData.append('quantityPerPack', data.cantidadXPaca ? Number(data.cantidadXPaca) : 0);
    formData.append('codBarras', data.codBarras);
    formData.append('stock', Number(data.stock) || 0);

    if (data.codsBarrasExtra?.length > 0) {
      data.codsBarrasExtra.forEach((barcode, idx) => {
        formData.append(`codsBarrasExtra[${idx}]`, barcode.cod);
        formData.append(`stocksExtra[${idx}]`, Number(barcode.stock) || 0);
      });
    }

    if (data.categories !== undefined) {
      formData.append('categories', JSON.stringify(data.categories));
    }

    if (data.subcategories !== undefined) {
      formData.append('subcategories', JSON.stringify(data.subcategories));
    }

    if (data.images?.length > 0) {
      data.images.forEach((img) => {
        formData.append('images', img);
      });
    }

    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data || null;
  },

  async update(id, data) {
    const formData = new FormData();

    if (data.nombre !== undefined)          formData.append('name', data.nombre);
    if (data.referencia !== undefined)      formData.append('reference', data.referencia);
    if (data.precioDetalle !== undefined)   formData.append('retailPrice', Number(data.precioDetalle));
    if (data.precioMayorista !== undefined) formData.append('wholesalePrice', Number(data.precioMayorista));
    if (data.precioColegas !== undefined)   formData.append('partnerPrice', Number(data.precioColegas));
    if (data.precioPacas !== undefined)     formData.append('bulkPrice', Number(data.precioPacas));
    if (data.ivaPercentage !== undefined)   formData.append('ivaPercentage', data.ivaPercentage);

    if (data.retailDiscountPct !== undefined)    formData.append('retailDiscountPct', data.retailDiscountPct);
    if (data.wholesaleDiscountPct !== undefined) formData.append('wholesaleDiscountPct', data.wholesaleDiscountPct);
    if (data.partnerDiscountPct !== undefined)   formData.append('partnerDiscountPct', data.partnerDiscountPct);
    if (data.bulkDiscountPct !== undefined)      formData.append('bulkDiscountPct', data.bulkDiscountPct);

    if (data.idUnitMeasure !== undefined) formData.append('idUnitMeasure', data.idUnitMeasure);

    if (data.idCategorie !== undefined || data.id_category !== undefined) {
      formData.append('idCategorie', data.id_category || data.idCategorie);
    }

    if (data.descripcion !== undefined)   formData.append('description', data.descripcion);
    if (data.cantidadXPaca !== undefined) formData.append('quantityPerPack', Number(data.cantidadXPaca));
    if (data.activo !== undefined)        formData.append('idStatus', data.activo ? 1 : 2);

    const barcodes = [];

    if (data.codBarras) {
      barcodes.push({
        barcode: data.codBarras,
        barcode_type: 'EAN13',
        stock: Number(data.stock) || 0,
      });
    }

    if (data.codsBarrasExtra?.length > 0) {
      data.codsBarrasExtra.forEach((barcode) => {
        if (barcode?.cod) {
          barcodes.push({
            barcode: barcode.cod,
            barcode_type: 'SKU',
            stock: Number(barcode.stock) || 0,
          });
        }
      });
    }

    formData.append('barcodes', JSON.stringify(barcodes));

    if (data.categories !== undefined) {
      formData.append('categories', JSON.stringify(data.categories));
    }

    if (data.subcategories !== undefined) {
      formData.append('subcategories', JSON.stringify(data.subcategories));
    }

    if (data.images?.length > 0) {
      data.images.forEach((img) => {
        formData.append('images', img);
      });
    }

    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data || null;
  },

  async delete(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data.success || false;
  },

  async toggleStatus(id) {
    const response = await apiClient.patch(`/products/${id}/toggle`);
    return response.data.data || null;
  },

  async decrementStock(items) {
    console.warn('decrementStock: Implementar cuando haya módulo de ventas');
  },

  async restoreStock(items) {
    console.warn('restoreStock: Implementar cuando haya módulo de ventas');
  },
};

export default ProductsService;