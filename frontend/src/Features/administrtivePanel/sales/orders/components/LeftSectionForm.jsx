// src/features/orders/components/LeftSectionForm.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ESTADOS_LOGISTICOS } from '../services/ordersService';
import {
  Users, Truck, MapPin, PackageCheck, FileX, ChevronDown, Home, Search, X,
  Phone, Mail, IdCard, FileText
} from 'lucide-react';

function LeftSectionForm({
  formData,
  errors,
  clientes,
  user,
  loading,
  isEditMode,
  onClienteChange,
  onTipoEntregaChange,
  onDireccionManualChange,
  onEstadoLogisticoChange,
  onMotivoCancelacionChange,
}) {
  const isEstadoListo = formData.estadoLogistico === ESTADOS_LOGISTICOS.LISTO;
  const mostrarDireccionManual = formData.tipoEntrega === 'domicilio';
  const isClienteDisabled = loading || isEditMode;

  // Estados para el buscador de clientes
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [isClienteDropdownOpen, setIsClienteDropdownOpen] = useState(false);
  const clienteWrapperRef = useRef(null);

  // Sincronizar el término de búsqueda con el cliente seleccionado
  useEffect(() => {
    if (formData.clienteId !== undefined && formData.clienteId !== null && formData.clienteId !== '') {
      const cliente = clientes.find(c => c.id === formData.clienteId);
      if (cliente) {
        setClienteSearchTerm(cliente.name || cliente.fullName || '');
      } else {
        setClienteSearchTerm('');
      }
    } else {
      setClienteSearchTerm('');
    }
  }, [formData.clienteId, clientes]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteWrapperRef.current && !clienteWrapperRef.current.contains(event.target)) {
        setIsClienteDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar clientes según término de búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!clienteSearchTerm.trim()) {
      return clientes;
    }
    const term = clienteSearchTerm.toLowerCase().trim();
    return clientes.filter(cliente => {
      const nombre = (cliente.name || cliente.fullName || '').toLowerCase();
      const telefono = (cliente.phone || '').toLowerCase();
      const email = (cliente.email || '').toLowerCase();
      const documento = (cliente.document || '').toLowerCase();
      const direccion = (cliente.address || cliente.direccion || '').toLowerCase();
      
      return nombre.includes(term) ||
             telefono.includes(term) ||
             email.includes(term) ||
             documento.includes(term) ||
             direccion.includes(term);
    });
  }, [clientes, clienteSearchTerm]);

  const handleClienteSelect = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      setClienteSearchTerm(cliente.name || cliente.fullName || '');
      onClienteChange({ target: { value: clienteId } });
    }
    setIsClienteDropdownOpen(false);
  };

  const handleClienteInputFocus = () => {
    if (!isClienteDisabled) {
      setIsClienteDropdownOpen(true);
    }
  };

  const handleClearClienteSearch = () => {
    setClienteSearchTerm('');
    onClienteChange({ target: { value: '' } });
  };

  // Clase base para selects
  const selectClass = (fieldName, isDisabled = false) => `
    appearance-none w-full pl-10 pr-8 py-2.5 text-sm border rounded-lg outline-none
    transition-colors duration-200
    ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
    ${isDisabled 
      ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-default' 
      : 'bg-white text-gray-700 cursor-pointer'
    }
  `;

  const textareaClass = (fieldName, isDisabled = false) => `
    w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 resize-none
    transition-colors duration-200
    ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
    ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
  `;

  // Mostrar error solo si el clienteId es inválido (null, undefined, o string vacío, pero no 0)
  const showClienteError = errors.clienteId && (formData.clienteId === undefined || formData.clienteId === null || formData.clienteId === '');

  const errorMsg = (fieldName) => (
    errors[fieldName] && <p className="mt-0.5 text-xs text-red-500">{errors[fieldName]}</p>
  );

  // Clases de color para el estado logístico
  const getEstadoColorClass = (estado) => {
    switch (estado) {
      case ESTADOS_LOGISTICOS.EN_PROCESO:
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case ESTADOS_LOGISTICOS.LISTO:
        return 'bg-green-50 text-green-800 border-green-300';
      case ESTADOS_LOGISTICOS.CANCELADO:
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return '';
    }
  };

  const estadoColorClass = getEstadoColorClass(formData.estadoLogistico);
  // El estado solo se deshabilita en edición y si el estado actual es 'listo'
  const isEstadoDisabled = loading || (isEditMode && isEstadoListo);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header de sección estilo ventas */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Información del pedido</p>
          <p className="text-xs text-gray-400">Datos del cliente y entrega</p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Cliente con buscador desplegable */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Cliente <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={clienteWrapperRef}>
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Buscar cliente por nombre, teléfono, email..."
              value={clienteSearchTerm}
              onChange={(e) => {
                setClienteSearchTerm(e.target.value);
                setIsClienteDropdownOpen(true);
              }}
              onFocus={handleClienteInputFocus}
              disabled={isClienteDisabled}
              className={`w-full pl-10 pr-8 py-2.5 text-sm border rounded-lg outline-none transition-colors duration-200
                ${errors.clienteId && showClienteError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
                ${isClienteDisabled ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700'}
              `}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
              {clienteSearchTerm && !isClienteDisabled && (
                <button
                  onClick={handleClearClienteSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4" strokeWidth={1.8} />
                </button>
              )}
              {!isClienteDisabled && (
                <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              )}
            </div>

            {/* Dropdown de clientes */}
            {isClienteDropdownOpen && !isClienteDisabled && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {clientesFiltrados.length > 0 ? (
                  <ul className="py-1">
                    {clientesFiltrados.map(cliente => (
                      <li key={cliente.id}>
                        <button
                          type="button"
                          onClick={() => handleClienteSelect(cliente.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[#004D77]/10 transition-colors duration-150"
                        >
                          <div className="font-medium text-gray-800">
                            {cliente.name || cliente.fullName}
                            {cliente.id === 0 && <span className="ml-2 text-xs text-blue-600">(Cliente de Caja)</span>}
                          </div>
                          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                            {cliente.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3 h-3" strokeWidth={1.5} />
                                {cliente.phone}
                              </span>
                            )}
                            {cliente.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="w-3 h-3" strokeWidth={1.5} />
                                {cliente.email}
                              </span>
                            )}
                            {cliente.document && (
                              <span className="inline-flex items-center gap-1">
                                <IdCard className="w-3 h-3" strokeWidth={1.5} />
                                {cliente.document}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No se encontraron clientes
                  </div>
                )}
              </div>
            )}
          </div>
          {showClienteError && errorMsg('clienteId')}
        </div>

        {/* Tipo de entrega */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de entrega <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
            <select
              value={formData.tipoEntrega}
              onChange={onTipoEntregaChange}
              disabled={loading}
              className={selectClass('tipoEntrega', loading)}
            >
              <option value="recoge">El cliente lo recoge</option>
              <option value="domicilio">Entrega a domicilio</option>
            </select>
            {!loading && (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            )}
          </div>
          {errorMsg('tipoEntrega')}
        </div>

        {/* Dirección (condicional) */}
        {mostrarDireccionManual ? (
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Dirección de entrega <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <textarea
                value={formData.direccionEntrega}
                onChange={onDireccionManualChange}
                rows={2}
                className={textareaClass('direccionEntrega', loading)}
                placeholder="Ej: Calle 123 #45-67"
                disabled={loading}
              />
            </div>
            {errorMsg('direccionEntrega')}
            {!isEditMode && formData.clienteId && (
              <button
                type="button"
                onClick={() => {
                  const cliente = clientes.find(c => c.id === formData.clienteId);
                  if (cliente) {
                    const direccionSugerida = cliente.id === 0
                      ? 'El cliente lo recoge'
                      : (cliente.address || cliente.direccion || '');
                    onDireccionManualChange({ target: { value: direccionSugerida } });
                  }
                }}
                className="mt-2 text-sm text-[#004D77] hover:bg-[#004D77]/10 inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors duration-200 w-fit"
              >
                <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                Usar dirección del cliente
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Dirección de entrega:</span> El cliente lo recoge
            </p>
          </div>
        )}

        {/* Estado Logístico con colores */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Estado del pedido <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PackageCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
            <select
              value={formData.estadoLogistico}
              onChange={onEstadoLogisticoChange}
              disabled={isEstadoDisabled}
              className={`${selectClass('estadoLogistico', isEstadoDisabled)} ${!isEstadoDisabled ? estadoColorClass : ''}`}
            >
              <option value={ESTADOS_LOGISTICOS.EN_PROCESO} className="bg-yellow-50 text-yellow-800">
                En proceso
              </option>
              <option value={ESTADOS_LOGISTICOS.LISTO} className="bg-green-50 text-green-800">
                Listo
              </option>
              <option value={ESTADOS_LOGISTICOS.CANCELADO} className="bg-red-50 text-red-800">
                Cancelado
              </option>
            </select>
            {!isEstadoDisabled && (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            )}
          </div>
          {errorMsg('estadoLogistico')}
          {isEditMode && isEstadoListo && (
            <p className="mt-0.5 text-xs text-gray-500">El estado "Listo" no se puede modificar.</p>
          )}
        </div>

        {/* Motivo de cancelación (condicional) */}
        {formData.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO && (
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileX className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <textarea
                value={formData.motivoCancelacion}
                onChange={onMotivoCancelacionChange}
                rows={3}
                className={textareaClass('motivoCancelacion', loading)}
                placeholder="Explique por qué se cancela el pedido..."
                disabled={loading}
              />
            </div>
            {errorMsg('motivoCancelacion')}
          </div>
        )}

        {/* Asesor asignado (solo lectura) */}
        {user && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Asesor asignado:</span> {user.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftSectionForm;