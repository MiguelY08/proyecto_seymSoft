/**
 * Archivo: providersService.js
 *
 * Este módulo actúa como la capa de servicio para el manejo de proveedores
 * consumiendo la API backend.
 */

import apiClient from '../../../../../setting/apiClient.js';

const isLegalProvider = (provider) =>
  String(provider?.personType || '').trim().toLowerCase() === 'juridica';

const getDisplayLastname = (provider) => {
  const lastname = String(provider?.lastname || '').trim();
  if (isLegalProvider(provider) && lastname.toLowerCase() === 'empresa') return '';
  return lastname;
};

const getDisplayName = (provider) => {
  if (isLegalProvider(provider)) return String(provider?.nameProvider || '').trim();
  return provider.fullName || `${provider.nameProvider || ''} ${getDisplayLastname(provider)}`.trim();
};

export const providersService = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 13, search = '', personType = '', idStatus = '' } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (personType) queryParams.append('personType', personType);
    if (idStatus) queryParams.append('idStatus', idStatus);
    
    const response = await apiClient.get(`/providers?${queryParams.toString()}`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al obtener proveedores');
    }
    
    const providers = result.data.map(provider => ({
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: getDisplayName(provider),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: getDisplayLastname(provider),
      telefono: provider.phone,
      correo: provider.email,
      direccion: provider.address,
      nombreContacto: provider.contactPersonName,
      numeroContacto: provider.contactPersonNumber,
      rut: provider.rut ? 'si' : 'no',
      codigoCIU: provider.ciuCode
    }));
    
    return {
      data: providers,
      pagination: result.pagination
    };
  },

  getById: async (id) => {
    const response = await apiClient.get(`/providers/${id}`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al obtener el proveedor');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: getDisplayName(provider),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: getDisplayLastname(provider),
      telefono: provider.phone,
      correo: provider.email,
      direccion: provider.address,
      nombreContacto: provider.contactPersonName,
      numeroContacto: provider.contactPersonNumber,
      rut: provider.rut ? 'si' : 'no',
      codigoCIU: provider.ciuCode
    };
  },

  create: async (providerData) => {
    const hasRut = providerData.rut === 'si';
    const payload = {
      personType: providerData.tipoPersona,
      documentType: providerData.tipo,
      documentNumber: providerData.numero,
      nameProvider: providerData.nombres,
      lastname: providerData.apellidos,
      email: providerData.correo,
      phone: providerData.telefono,
      address: providerData.direccion,
      contactPersonName: providerData.nombreContacto,
      contactPersonNumber: providerData.numeroContacto ? Number(providerData.numeroContacto) : null,
      rut: hasRut,
      ciuCode: hasRut ? providerData.codigoCIU || null : null,
      maxReturnPeriod: providerData.plazoDevoluciones ? parseInt(providerData.plazoDevoluciones) : null,
      categoryIds: providerData.categoryIds || [],
      idStatus: 1
    };
    
    const response = await apiClient.post('/providers', payload);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al crear el proveedor');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: getDisplayName(provider),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: getDisplayLastname(provider),
      telefono: provider.phone,
      correo: provider.email,
      direccion: provider.address,
      nombreContacto: provider.contactPersonName,
      numeroContacto: provider.contactPersonNumber,
      rut: provider.rut ? 'si' : 'no',
      codigoCIU: provider.ciuCode
    };
  },

  /**
   *  UPDATE CORREGIDO - Usa los nombres que envía FormProvider
   */
  update: async (id, providerData) => {
    const payload = {};
    
    // Usa los nombres que vienen de FormProvider
    const hasRut = providerData.rut === 'si';
    if (providerData.tipoPersona !== undefined) payload.personType = providerData.tipoPersona;
    if (providerData.correo !== undefined) payload.email = providerData.correo;
    if (providerData.phone !== undefined) payload.phone = providerData.phone;
    if (providerData.direccion !== undefined) payload.address = providerData.direccion;
    if (providerData.nombreContacto !== undefined) payload.contactPersonName = providerData.nombreContacto;
    if (providerData.numeroContacto !== undefined) payload.contactPersonNumber = providerData.numeroContacto ? Number(providerData.numeroContacto) : null;
    if (providerData.rut !== undefined) payload.rut = hasRut;
    if (providerData.codigoCIU !== undefined || providerData.rut !== undefined) {
      payload.ciuCode = hasRut ? providerData.codigoCIU || null : null;
    }
    if (providerData.plazoDevoluciones !== undefined) payload.maxReturnPeriod = providerData.plazoDevoluciones ? parseInt(providerData.plazoDevoluciones) : null;
    if (providerData.categoryIds !== undefined) payload.categoryIds = providerData.categoryIds;
    if (providerData.idStatus !== undefined) payload.idStatus = providerData.idStatus;
    
    const response = await apiClient.put(`/providers/${id}`, payload);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al actualizar el proveedor');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: getDisplayName(provider),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: getDisplayLastname(provider),
      telefono: provider.phone,
      correo: provider.email,
      direccion: provider.address,
      nombreContacto: provider.contactPersonName,
      numeroContacto: provider.contactPersonNumber,
      rut: provider.rut ? 'si' : 'no',
      codigoCIU: provider.ciuCode
    };
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/providers/${id}`);
      const result = response.data;

      if (!response.data.success && result.message) {
        const serviceError = new Error(result.message || 'Error al eliminar el proveedor');
        serviceError.response = { data: result };
        serviceError.errorCode = result.errorCode || null;
        throw serviceError;
      }

      return true;
    } catch (error) {
      const responseData = error?.response?.data || {};
      const message =
        responseData.message ||
        responseData.error ||
        error?.message ||
        'Error al eliminar el proveedor';

      const serviceError = new Error(message);
      serviceError.response = error?.response;
      serviceError.errorCode = responseData.errorCode || error?.errorCode || null;
      throw serviceError;
    }
  },

  toggleActive: async (id) => {
    const response = await apiClient.patch(`/providers/${id}/status`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al cambiar el estado');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: getDisplayName(provider),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: getDisplayLastname(provider),
      telefono: provider.phone,
      correo: provider.email,
      direccion: provider.address,
      nombreContacto: provider.contactPersonName,
      numeroContacto: provider.contactPersonNumber,
      rut: provider.rut ? 'si' : 'no',
      codigoCIU: provider.ciuCode
    };
  }
};
