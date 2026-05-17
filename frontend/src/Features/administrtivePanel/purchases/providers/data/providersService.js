/**
 * Archivo: providersService.js
 *
 * Este módulo actúa como la capa de servicio para el manejo de proveedores
 * consumiendo la API backend.
 */

import axios from 'axios';

// URL base de la API (ajusta según tu entorno)
const API_BASE_URL = 'http://localhost:3000/api/providers';

// Helper para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('accessToken') || '';
};

// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getAuthToken()}`;
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Error en la petición';
    throw new Error(message);
  }
);

export const providersService = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 13, search = '', personType = '', idStatus = '' } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (personType) queryParams.append('personType', personType);
    if (idStatus) queryParams.append('idStatus', idStatus);
    
    const response = await api.get(`?${queryParams.toString()}`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al obtener proveedores');
    }
    
    const providers = result.data.map(provider => ({
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: provider.fullName || `${provider.nameProvider} ${provider.lastname}`.trim(),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: provider.lastname,
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
    const response = await api.get(`/${id}`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al obtener el proveedor');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: provider.fullName || `${provider.nameProvider} ${provider.lastname}`.trim(),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: provider.lastname,
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
      rut: providerData.rut === 'si',
      ciuCode: providerData.codigoCIU || null,
      maxReturnPeriod: providerData.plazoDevoluciones ? parseInt(providerData.plazoDevoluciones) : null,
      categoryIds: providerData.categoryIds || [],
      idStatus: 1
    };
    
    const response = await api.post('', payload);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al crear el proveedor');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: provider.fullName || `${provider.nameProvider} ${provider.lastname}`.trim(),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: provider.lastname,
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
    if (providerData.tipoPersona !== undefined) payload.personType = providerData.tipoPersona;
    if (providerData.correo !== undefined) payload.email = providerData.correo;
    if (providerData.phone !== undefined) payload.phone = providerData.phone;
    if (providerData.direccion !== undefined) payload.address = providerData.direccion;
    if (providerData.nombreContacto !== undefined) payload.contactPersonName = providerData.nombreContacto;
    if (providerData.numeroContacto !== undefined) payload.contactPersonNumber = providerData.numeroContacto ? Number(providerData.numeroContacto) : null;
    if (providerData.rut !== undefined) payload.rut = providerData.rut === 'si';
    if (providerData.codigoCIU !== undefined) payload.ciuCode = providerData.codigoCIU || null;
    if (providerData.plazoDevoluciones !== undefined) payload.maxReturnPeriod = providerData.plazoDevoluciones ? parseInt(providerData.plazoDevoluciones) : null;
    if (providerData.categoryIds !== undefined) payload.categoryIds = providerData.categoryIds;
    if (providerData.idStatus !== undefined) payload.idStatus = providerData.idStatus;
    
    console.log(' Update payload:', payload);
    
    const response = await api.put(`/${id}`, payload);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al actualizar el proveedor');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: provider.fullName || `${provider.nameProvider} ${provider.lastname}`.trim(),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: provider.lastname,
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
    const response = await api.delete(`/${id}`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al eliminar el proveedor');
    }
    
    return true;
  },

  toggleActive: async (id) => {
    const response = await api.patch(`/${id}/status`);
    const result = response.data;
    
    if (!response.data.success && result.message) {
      throw new Error(result.message || 'Error al cambiar el estado');
    }
    
    const provider = result.data;
    
    return {
      id: provider.id,
      tipo: provider.documentType,
      numero: provider.documentNumber,
      nombre: provider.fullName || `${provider.nameProvider} ${provider.lastname}`.trim(),
      pContacto: provider.contactPersonName,
      nuContacto: provider.contactPersonNumber,
      plazoDevoluciones: provider.maxReturnPeriod,
      categorias: provider.categories,
      activo: provider.active,
      tipoPersona: provider.personType,
      nombres: provider.nameProvider,
      apellidos: provider.lastname,
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