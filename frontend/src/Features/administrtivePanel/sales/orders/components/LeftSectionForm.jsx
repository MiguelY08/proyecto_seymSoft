// src/features/orders/components/LeftSectionForm.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ESTADOS_LOGISTICOS } from '../services/ordersService';
import {
  Users, Truck, MapPin, PackageCheck, FileX, ChevronDown, Home, X,
  Phone, Mail, IdCard, FileText, Plus
} from 'lucide-react';
import FormSelect from '../../../../shared/FormSelect';

function LeftSectionForm({
  formData,
  errors,
  clientes,
  departamentos = [],
  ciudades = [],
  loadingCiudades = false,
  user,
  loading,
  readOnly = false,
  isEditMode,
  estadoLogisticoOriginal = null,
  showDirectSaleLockedInfo = false,
  highlightShippingAmount = false,
  onClienteChange,
  onTipoEntregaChange,
  onDepartamentoEntregaChange,
  onCiudadEntregaChange,
  onDireccionManualChange,
  onDeliveryRecipientNameChange,
  onDeliveryRecipientPhoneChange,
  onShippingAmountChange,
  onEstadoLogisticoChange,
  onMotivoCancelacionChange,
  onCreateClient,
}) {
  const isEstadoPersistidoInmutable = [
    ESTADOS_LOGISTICOS.ENTREGADO,
    ESTADOS_LOGISTICOS.CANCELADO,
  ].includes(estadoLogisticoOriginal);
  const mostrarAvisoEntregadoPendiente =
    !isEstadoPersistidoInmutable &&
    formData.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO;
  const mensajeEntregadoPendiente = isEditMode
    ? 'Al guardar como Entregado, el pedido quedara inmutable y el pago debe estar completo. Si el pago se completa ahora, tambien se generara la venta manual.'
    : 'Al guardar como Entregado, se registrara como venta directa. Debes agregar el pago completo antes de crear el registro.';
  const mostrarDireccionManual = formData.tipoEntrega === 'domicilio';
  const showShippingAmountHighlight = mostrarDireccionManual && highlightShippingAmount;
  const isClienteDisabled = loading || readOnly || isEditMode;

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

  const clienteSeleccionado = useMemo(() => (
    clientes.find((cliente) => Number(cliente.id) === Number(formData.clienteId)) ?? null
  ), [clientes, formData.clienteId]);
  const nombreClienteSeleccionado = (
    clienteSeleccionado?.name ||
    clienteSeleccionado?.fullName ||
    clienteSeleccionado?.user?.fullName ||
    ''
  ).trim();

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
      case ESTADOS_LOGISTICOS.ENTREGADO:
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case ESTADOS_LOGISTICOS.CANCELADO:
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return '';
    }
  };

  const estadoColorClass = getEstadoColorClass(formData.estadoLogistico);
  // El estado solo se deshabilita en edición y si el estado actual es 'listo'
  const isEstadoDisabled = loading || readOnly || isEstadoPersistidoInmutable;
  const tipoEntregaOptions = [
    { value: 'recoge', label: 'El cliente lo recoge' },
    { value: 'domicilio', label: 'Entrega a domicilio' },
  ];
  const departamentoOptions = departamentos.map((department) => ({
    value: department.code,
    label: department.name,
  }));
  const ciudadOptions = ciudades.map((city) => ({
    value: city.code,
    label: city.name,
  }));
  const estadoOptions = [
    { value: ESTADOS_LOGISTICOS.EN_PROCESO, label: 'En proceso' },
    { value: ESTADOS_LOGISTICOS.LISTO, label: 'Listo' },
    { value: ESTADOS_LOGISTICOS.ENTREGADO, label: 'Entregado' },
    ...(formData.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO
      ? [{ value: ESTADOS_LOGISTICOS.CANCELADO, label: 'Cancelado' }]
      : []),
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header de sección estilo ventas */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3.5 sm:px-5">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">Información del pedido</p>
          <p className="text-xs text-gray-400">Datos del cliente y entrega</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Cliente con buscador desplegable */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Cliente <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1" ref={clienteWrapperRef}>
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
              <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg overscroll-contain">
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
          {onCreateClient && !readOnly && !isEditMode && (
            <button
              type="button"
              onClick={onCreateClient}
              disabled={loading}
              title="Crear cliente"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-10 sm:shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          </div>
          {showClienteError && errorMsg('clienteId')}
        </div>

        {mostrarDireccionManual && !showDirectSaleLockedInfo && (
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Persona que recibe/recoge <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="text"
                value={formData.deliveryRecipientName || ''}
                onChange={onDeliveryRecipientNameChange}
                placeholder="Nombre completo de quien recibe o recoge"
                disabled={loading || readOnly}
                maxLength={255}
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
                  ${errors.deliveryRecipientName ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
                  ${loading || readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                `}
              />
            </div>
            {errorMsg('deliveryRecipientName')}
            {nombreClienteSeleccionado && !readOnly && (
              <button
                type="button"
                onClick={() => {
                  onDeliveryRecipientNameChange({ target: { value: nombreClienteSeleccionado } });
                }}
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm text-[#004D77] transition-colors duration-200 hover:bg-[#004D77]/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit sm:justify-start sm:py-1"
              >
                <Users className="w-3.5 h-3.5" strokeWidth={1.8} />
                Usar nombre del cliente
              </button>
            )}

            <label className="mt-2 block text-sm font-medium text-gray-700">
              Telefono de quien recibe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="tel"
                value={formData.deliveryRecipientPhone || ''}
                onChange={onDeliveryRecipientPhoneChange}
                placeholder="Ej: 300 123 4567"
                disabled={loading || readOnly}
                maxLength={30}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors duration-200
                  ${errors.deliveryRecipientPhone ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
                  ${loading || readOnly ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}
                `}
              />
            </div>
            {errorMsg('deliveryRecipientPhone')}
          </div>
        )}

        {/* Tipo de entrega */}
        {showDirectSaleLockedInfo ? (
          <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 sm:px-4">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" strokeWidth={1.8} />
            <div>
              <p className="text-sm font-semibold text-blue-900">Venta directa en caja</p>
              <p className="text-sm text-blue-800">
                El tipo de entrega queda como Cliente lo recoge porque el cliente se lleva el pedido en el momento.
              </p>
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${mostrarDireccionManual ? 'md:grid-cols-2' : ''} gap-4`}>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de entrega <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={formData.tipoEntrega}
                options={tipoEntregaOptions}
                onChange={(value) => onTipoEntregaChange({ target: { value } })}
                icon={Truck}
                disabled={loading || readOnly}
                error={errors.tipoEntrega}
                placeholder="Tipo de entrega"
                ariaLabel="Tipo de entrega"
              />
              {errorMsg('tipoEntrega')}
            </div>

            {mostrarDireccionManual && (
              <div className={`flex flex-col gap-1.5 rounded-xl transition-colors ${
                showShippingAmountHighlight
                  ? 'border border-amber-300 bg-amber-50 p-3 shadow-[0_0_0_3px_rgba(251,191,36,0.18)]'
                  : ''
              }`}>
                <label className={`block text-sm font-medium ${
                  showShippingAmountHighlight ? 'text-amber-900' : 'text-gray-700'
                }`}>
                  Total del envío <span className="text-red-500">*</span>
                  {showShippingAmountHighlight && (
                    <span className="ml-2 inline-flex rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                      Envio pendiente
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Truck className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    showShippingAmountHighlight ? 'text-amber-600' : 'text-gray-400'
                  }`} strokeWidth={1.8} />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.shippingAmount ?? ''}
                    onChange={onShippingAmountChange}
                    placeholder="0"
                    disabled={loading || readOnly}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
                      ${errors.shippingAmount
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : showShippingAmountHighlight
                          ? 'border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                          : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'}
                      ${loading || readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                    `}
                  />
                </div>
                {showShippingAmountHighlight && !errors.shippingAmount && (
                  <p className="text-xs font-semibold text-amber-800">
                    Este pedido web a domicilio necesita que el asesor registre el valor del envio.
                  </p>
                )}
                {errorMsg('shippingAmount')}
              </div>
            )}
          </div>
        )}

        {/* Dirección (condicional) */}
        {mostrarDireccionManual && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Departamento <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  value={formData.departamentoEntregaCodigo || ''}
                  options={departamentoOptions}
                  onChange={(value) => onDepartamentoEntregaChange({ target: { value } })}
                  icon={MapPin}
                  disabled={loading || readOnly}
                  error={errors.departamentoEntregaCodigo || errors.departamentoEntregaNombre}
                  placeholder="Seleccione departamento"
                  searchable
                  searchPlaceholder="Buscar departamento..."
                  noOptionsMessage="No se encontraron departamentos"
                  ariaLabel="Departamento de entrega"
                />
                {errorMsg('departamentoEntregaCodigo') || errorMsg('departamentoEntregaNombre')}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Municipio/Ciudad <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  value={formData.ciudadEntregaCodigo || ''}
                  options={ciudadOptions}
                  onChange={(value) => onCiudadEntregaChange({ target: { value } })}
                  icon={MapPin}
                  disabled={loading || readOnly || loadingCiudades || !formData.departamentoEntregaCodigo}
                  error={errors.ciudadEntregaCodigo || errors.ciudadEntregaNombre}
                  placeholder={loadingCiudades ? 'Cargando municipios...' : 'Seleccione municipio/ciudad'}
                  searchable
                  searchPlaceholder="Buscar municipio/ciudad..."
                  noOptionsMessage="No se encontraron municipios/ciudades"
                  ariaLabel="Municipio o ciudad de entrega"
                />
                {errorMsg('ciudadEntregaCodigo') || errorMsg('ciudadEntregaNombre')}
              </div>
            </div>

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
                  className={textareaClass('direccionEntrega', loading || readOnly)}
                  placeholder="Ej: Calle 123 #45-67"
                  disabled={loading || readOnly}
                />
              </div>
              {errorMsg('direccionEntrega')}
              {!isEditMode && !readOnly && formData.clienteId && (
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
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm text-[#004D77] transition-colors duration-200 hover:bg-[#004D77]/10 sm:w-fit sm:justify-start sm:py-1"
                >
                  <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Usar dirección del cliente
                </button>
              )}
            </div>
          </div>
        )}

        {/* Estado Logístico con colores */}
        {showDirectSaleLockedInfo ? (
          <div className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 px-3 py-3 sm:px-4">
            <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-700" strokeWidth={1.8} />
            <div>
              <p className="text-sm font-semibold text-green-900">Pedido entregado</p>
              <p className="text-sm text-green-800">
                El estado del pedido queda como Entregado al registrar una venta directa.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Estado del pedido <span className="text-red-500">*</span>
            </label>
            <FormSelect
              value={formData.estadoLogistico}
              options={estadoOptions}
              onChange={(value) => onEstadoLogisticoChange({ target: { value } })}
              icon={PackageCheck}
              disabled={isEstadoDisabled}
              error={errors.estadoLogistico}
              placeholder="Estado del pedido"
              className={!isEstadoDisabled ? estadoColorClass : ''}
              ariaLabel="Estado del pedido"
              placement="bottom"
            />
            {errorMsg('estadoLogistico')}
            {isEditMode && isEstadoPersistidoInmutable && (
              <p className="mt-0.5 text-xs text-gray-500">Los pedidos entregados o cancelados no se pueden modificar.</p>
            )}
            {mostrarAvisoEntregadoPendiente && (
              <div className="mt-2 flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 px-3 py-3 sm:px-4">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-700" strokeWidth={1.8} />
                <div>
                  <p className="text-sm font-semibold text-green-900">Pedido entregado</p>
                  <p className="text-sm text-green-800">{mensajeEntregadoPendiente}</p>
                </div>
              </div>
            )}
          </div>
        )}

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
                disabled={loading || readOnly}
              />
            </div>
            {errorMsg('motivoCancelacion')}
          </div>
        )}

        {/* Asesor asignado (solo lectura) */}
        {user && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Asesor asignado:</span> {user.name || user.fullName || user.email || 'Usuario actual'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftSectionForm;
