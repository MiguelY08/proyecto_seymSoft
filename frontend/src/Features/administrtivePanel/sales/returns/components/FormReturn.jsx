/**
 * Archivo: FormReturn.jsx
 * 
 * Formulario modal para crear o editar devoluciones de ventas.
 * 
 * EN MODO EDICIÓN: Solo se puede modificar:
 * - Estado general de la devolución
 * - Estado de cada producto individualmente
 * 
 * Todos los demás campos están deshabilitados con mensaje informativo.
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronLeft, Minus, Plus, Image } from 'lucide-react';
import Evidence from './Evidence';
import { useAlert } from '../../../../shared/alerts/useAlert';
import {
  getProductStatesForMethod,
  getInitialStateForMethod,
  calculateGeneralStatus,
  getStatusStyle,
  isValidStateForMethod
} from '../utils/returnsHelpers';

// ======================= DATOS DE REFERENCIA =======================

const PRODUCTOS_VENTA = [
  { id: 1, nombre: 'Libreta con lapicero',    cantidad: 1, precioUnit: 5000, imagen: null },
  { id: 2, nombre: 'Pincel #10',              cantidad: 6, precioUnit: 1200, imagen: null },
  { id: 3, nombre: 'Cosedora Xingli XL207 Y', cantidad: 3, precioUnit: 5000, imagen: null },
  { id: 4, nombre: 'Silicona liquida ET131 X', cantidad: 8, precioUnit: 2900, imagen: null },
];

// Motivos de devolución según especificaciones
const MOTIVOS = [
  'DEFECTUOSO',
  'PRODUCTO_EQUIVOCADO',
  'PRODUCTO_INCOMPLETO',
  'MAL_ESTADO',
  'PRODUCTO_USADO',
  'OTRO'
];

// Métodos de devolución según especificaciones
const METODOS = ['Reemplazo', 'Reembolso', 'Saldo a favor'];

// Estados generales automáticos (no se seleccionan manualmente, se calculan)
// Se muestran los estados posibles, pero en realidad se calculan basados en productos
const ESTADOS_P = ['En Proceso', 'Procesada', 'Anulado'];

// Mapa de etiquetas legibles para motivos
const MOTIVOS_LABELS = {
  'DEFECTUOSO': 'Producto defectuoso',
  'PRODUCTO_EQUIVOCADO': 'Producto equivocado',
  'PRODUCTO_INCOMPLETO': 'Producto incompleto',
  'MAL_ESTADO': 'Producto en mal estado',
  'PRODUCTO_USADO': 'Producto usado',
  'OTRO': 'Otro'
};

const formatCOP = (v) => new Intl.NumberFormat('es-CO').format(v);

// ======================= COMPONENTES AUXILIARES =======================

function ProductoImg({ src, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (src) return <img src={src} alt="" className={`${dim} rounded-lg object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
      <Image className="w-4 h-4 text-gray-300" />
    </div>
  );
}

function EstadoBadgeSelect({ value, onChange, metodo }) {
  const [open, setOpen] = useState(false);
  
  // Obtener estados válidos para el método seleccionado
  const validStates = metodo ? getProductStatesForMethod(metodo) : [];
  
  // Mapear colores para los nuevos estados
  const colorMap = {
    'Pend. Envío': 'bg-orange-100 text-orange-600 border-orange-300',
    'Pend. Reemplazo': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Pend. Reembolso': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Entregado': 'bg-green-100 text-green-700 border-green-300',
  };
  
  const color = colorMap[value] ?? 'bg-orange-100 text-orange-600 border-orange-300';
  
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${color}`}>
        {value}<ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
          {validStates.map((e) => (
            <button key={e} type="button" onClick={() => { onChange(e); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function DisabledField({ label, value, required = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500">
        {value || '—'}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

function DisabledTextarea({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <textarea
        value={value || ''}
        disabled
        rows={4}
        className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-500 resize-none cursor-not-allowed"
      />
      <p className="text-xs text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

function DisabledEvidence({ count }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">Evidencias</label>
      <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 flex items-center justify-between">
        <span>{count === 0 ? 'Sin evidencias' : `${count} archivo(s) adjunto(s)`}</span>
        <Image className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

function DisabledDeliveryToggle({ isDelivery }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700">Domicilio</span>
        <div className={`relative w-12 h-6 rounded-full ${isDelivery ? 'bg-green-500' : 'bg-gray-300'} opacity-50`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${isDelivery ? 'left-[26px]' : 'left-0.5'}`} />
          {isDelivery && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white text-[9px] font-bold">✓</span>}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        No se puede modificar en edición
      </p>
    </div>
  );
}

const generateTempId = () => Date.now() + Math.random();

// ======================= COMPONENTE: PRODUCTO SELECCIONADO (VERSIÓN EDICIÓN) =======================

function ProductoSeleccionadoEditMode({ producto, configs, onConfigChange, submitted }) {
  const [expanded, setExpanded] = useState(true);
  const maxTotalQuantity = producto.cantidad;
  const totalQuantityUsed = configs.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0);

  const handleStatusChange = (index, newStatus) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], estado: newStatus };
    onConfigChange(newConfigs);
  };

  return (
    <div className="border rounded-xl overflow-hidden transition-colors border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f1f1f1]">
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
        </button>
        <input type="checkbox" checked readOnly disabled
          className="accent-[#004D77] w-4 h-4 cursor-not-allowed flex-shrink-0 opacity-50" />
        <ProductoImg src={producto.imagen} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{producto.nombre}</p>
          <p className="text-[11px] text-gray-500">
            Usados: {totalQuantityUsed} de {maxTotalQuantity} | {configs.length} config(s)
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-xs font-bold text-gray-700">${formatCOP(maxTotalQuantity * producto.precioUnit)}</p>
        </div>
      </div>

      {/* Formulario expandido - SOLO ESTADO EDITABLE */}
      {expanded && (
        <div className="bg-white px-3 py-3 border-t border-gray-100">
          {configs.map((config, index) => (
            <div key={config.id} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
              {configs.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">Configuración {index + 1} de {configs.length}</span>
                  <div className="text-gray-400 text-[10px]">
                    Bloqueado
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Motivo - solo lectura */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <div className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {MOTIVOS_LABELS[config.motivo] || config.motivo || '—'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    No se puede modificar en edición
                  </p>
                </div>

                {/* Estado - EDITABLE (sin candado) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estado<span className="text-red-500">*</span>
                  </label>
                  <EstadoBadgeSelect 
                    value={config.estado} 
                    onChange={(v) => handleStatusChange(index, v)}
                    metodo={config.metodo}
                  />
                </div>

                {/* Método - solo lectura */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Método devolución
                  </label>
                  <div className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {config.metodo || '—'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    No se puede modificar en edición
                  </p>
                </div>

                {/* Cantidad - solo lectura */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <div className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {config.cantidad || 1}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    No se puede modificar en edición
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================= COMPONENTE: PRODUCTO SELECCIONADO (VERSIÓN CREACIÓN) =======================

function ProductoSeleccionadoCreateMode({ producto, configs, onConfigsChange, onRemove, submitted }) {
  const [expanded, setExpanded] = useState(true);
  const [touched, setTouched] = useState({});
  const maxTotalQuantity = producto.cantidad;

  const totalQuantityUsed = configs.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0);
  const remainingQuantity = maxTotalQuantity - totalQuantityUsed;

  const validateField = (name, value) => {
    if (name === 'motivo' && (!value || !value.trim())) return 'Seleccione el motivo de la devolución';
    if (name === 'metodo' && (!value || !value.trim())) return 'Seleccione el método de devolución';
    return '';
  };

  const handleMetodoChange = (index, newMetodo) => {
    const newConfigs = [...configs];
    // Cambiar el método y resetear el estado al primero disponible para ese método
    const newState = getInitialStateForMethod(newMetodo);
    newConfigs[index] = { 
      ...newConfigs[index], 
      metodo: newMetodo,
      estado: newState
    };
    onConfigsChange(newConfigs);
  };

  const handleConfigChange = (index, field, value) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    onConfigsChange(newConfigs);
  };

  const handleConfigBlur = (index, field) => {
    setTouched(prev => ({ ...prev, [`${index}-${field}`]: true }));
  };

  const handleAddConfig = () => {
    if (remainingQuantity <= 0) return;
    const newConfig = {
      id: generateTempId(),
      motivo: '',
      descripcionMotivo: '',
      estado: 'Pend. Envío',
      metodo: '',
      cantidad: 1
    };
    onConfigsChange([...configs, newConfig]);
  };

  const handleRemoveConfig = (index) => {
    if (configs.length <= 1) {
      onRemove();
      return;
    }
    const newConfigs = configs.filter((_, i) => i !== index);
    onConfigsChange(newConfigs);
  };

  const renderConfigError = (configIndex, field, value) => {
    if ((touched[`${configIndex}-${field}`] || submitted) && validateField(field, value)) {
      return <p className="mt-0.5 text-xs text-red-600">{validateField(field, value)}</p>;
    }
    return null;
  };

  const configFieldClass = (configIndex, field, value) => {
    const hasError = (touched[`${configIndex}-${field}`] || submitted) && validateField(field, value);
    return `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors cursor-pointer ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  return (
    <div className="border rounded-xl overflow-hidden transition-colors border-gray-300">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f1f1f1]">
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
        </button>
        <input type="checkbox" checked readOnly
          className="accent-[#004D77] w-4 h-4 cursor-pointer flex-shrink-0"
          onClick={onRemove} />
        <ProductoImg src={producto.imagen} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{producto.nombre}</p>
          <p className="text-[11px] text-gray-500">
            Usados: {totalQuantityUsed} de {maxTotalQuantity} | {configs.length} config(s)
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-xs font-bold text-gray-700">${formatCOP(maxTotalQuantity * producto.precioUnit)}</p>
        </div>
      </div>

      {/* Formulario expandido */}
      {expanded && (
        <div className="bg-white px-3 py-3 border-t border-gray-100">
          {configs.map((config, index) => (
            <div key={config.id} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
              {configs.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">Configuración {index + 1} de {configs.length}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveConfig(index)}
                    className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                    title="Eliminar configuración"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Motivo */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Motivo<span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={config.motivo}
                    onChange={(e) => handleConfigChange(index, 'motivo', e.target.value)}
                    onBlur={() => handleConfigBlur(index, 'motivo')}
                    className={configFieldClass(index, 'motivo', config.motivo)}>
                    <option value="">Selecciona una opción</option>
                    {MOTIVOS.map((m) => <option key={m} value={m}>{MOTIVOS_LABELS[m]}</option>)}
                  </select>
                  {renderConfigError(index, 'motivo', config.motivo)}
                </div>

                {/* Método devolución - IMPORTANTE: Cambio automático de estados */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Método devolución<span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={config.metodo}
                    onChange={(e) => handleMetodoChange(index, e.target.value)}
                    onBlur={() => handleConfigBlur(index, 'metodo')}
                    className={configFieldClass(index, 'metodo', config.metodo)}>
                    <option value="">Selecciona una opción</option>
                    {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {renderConfigError(index, 'metodo', config.metodo)}
                </div>

                {/* Estado - Dinámico según el método */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estado<span className="text-red-500">*</span>
                  </label>
                  <EstadoBadgeSelect 
                    value={config.estado} 
                    onChange={(v) => handleConfigChange(index, 'estado', v)}
                    metodo={config.metodo}
                  />
                  {config.metodo && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Estados para {config.metodo}
                    </p>
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cantidad<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => {
                        const newValue = Math.max(1, config.cantidad - 1);
                        handleConfigChange(index, 'cantidad', newValue);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number" 
                      value={config.cantidad} 
                      min={1} 
                      max={remainingQuantity + config.cantidad}
                      onChange={(e) => {
                        const newValue = Math.min(
                          remainingQuantity + config.cantidad,
                          Math.max(1, Number(e.target.value))
                        );
                        handleConfigChange(index, 'cantidad', newValue);
                      }}
                      className="w-10 text-center border border-gray-300 rounded-lg px-1 py-1.5 text-sm text-gray-700 outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20" />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newValue = Math.min(remainingQuantity + config.cantidad, config.cantidad + 1);
                        handleConfigChange(index, 'cantidad', newValue);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Max disponible: {remainingQuantity + config.cantidad}
                  </span>
                </div>
              </div>

              {/* Campo descriptivo - Solo si motivo es OTRO */}
              {config.motivo === 'OTRO' && (
                <div className="mt-3 col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descripción del motivo<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={config.descripcionMotivo || ''}
                    onChange={(e) => handleConfigChange(index, 'descripcionMotivo', e.target.value)}
                    placeholder="Explica brevemente el motivo de la devolución"
                    rows={3}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 resize-none"
                  />
                </div>
              )}
            </div>
          ))}

          {remainingQuantity > 0 && (
            <button
              type="button"
              onClick={handleAddConfig}
              className="mt-4 w-full py-2 border border-dashed border-[#004D77] rounded-lg text-[#004D77] text-xs font-semibold hover:bg-[#004D77]/5 transition cursor-pointer"
            >
              + Agregar otra configuración ({remainingQuantity} unidades restantes)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ======================= COMPONENTE PRINCIPAL =======================

function FormReturn({ isOpen, onClose, returnData = null, onSave }) {
  const isEdit = Boolean(returnData);

  const [noFactura,    setNoFactura]    = useState('');
  const [cliente,      setCliente]      = useState('');
  const [asesor,       setAsesor]       = useState('');
  const [estadoGral,   setEstadoGral]   = useState('Pendiente');
  const [evidencias,   setEvidencias]   = useState([]);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [domicilio,    setDomicilio]    = useState(true);
  const [direccion,    setDireccion]    = useState('');
  const [descripcion,  setDescripcion]  = useState('');
  const [seleccionados, setSeleccionados] = useState({});
  const [submitted,    setSubmitted]    = useState(false);

  const [errors, setErrors] = useState({
    noFactura: '',
    cliente: '',
    asesor: '',
    direccion: '',
    evidencias: '',
    productos: ''
  });
  const [touched, setTouched] = useState({
    noFactura: false,
    cliente: false,
    asesor: false,
    direccion: false,
    evidencias: false
  });

  const { showError } = useAlert();

  useEffect(() => {
    if (returnData) {
      setNoFactura(returnData.numeroFactura ?? returnData.noFactura ?? '');
      setCliente(returnData.cliente ?? '');
      setAsesor(returnData.asesor ?? '');
      // Estado general se guarda como viene de la devolución
      setEstadoGral(returnData.estado ?? 'En Proceso');
      setDescripcion(returnData.descripcion ?? '');
      setDomicilio(returnData.domicilio ?? true);
      setDireccion(returnData.direccion ?? '');
      setEvidencias(returnData.evidencias ?? []);
      
      const seleccionadosIniciales = {};
      if (returnData.productosDevueltos) {
        returnData.productosDevueltos.forEach(p => {
          if (!seleccionadosIniciales[p.id]) {
            seleccionadosIniciales[p.id] = [];
          }
          seleccionadosIniciales[p.id].push({
            id: p.configId || generateTempId(),
            motivo: p.motivo || '',
            descripcionMotivo: p.descripcionMotivo || '',
            estado: p.estado || 'Pend. Envío',
            metodo: p.metodo || '',
            cantidad: p.cantidad || 1
          });
        });
      }
      setSeleccionados(seleccionadosIniciales);
    } else {
      setNoFactura(''); setCliente(''); setAsesor('');
      setEstadoGral('En Proceso'); // Estado inicial automático para nuevas devoluciones
      setEvidencias([]);
      setDomicilio(true); setDireccion('');
      setDescripcion(''); setSeleccionados({});
    }
    setSubmitted(false);
    setErrors({
      noFactura: '',
      cliente: '',
      asesor: '',
      direccion: '',
      evidencias: '',
      productos: ''
    });
    setTouched({
      noFactura: false,
      cliente: false,
      asesor: false,
      direccion: false,
      evidencias: false
    });
  }, [returnData, isOpen]);

  useEffect(() => {
    if (!domicilio) {
      setErrors(prev => ({ ...prev, direccion: '' }));
      setTouched(prev => ({ ...prev, direccion: false }));
    }
  }, [domicilio]);

  // Auto-calcular estado general cuando cambian los estados de productos
  useEffect(() => {
    const productosDevueltosData = Object.entries(seleccionados)
      .flatMap(([id, configs]) => {
        const producto = PRODUCTOS_VENTA.find(p => p.id === Number(id));
        if (!producto || !configs) return [];

        return configs.map((config) => ({
          id: producto.id,
          configId: config.id,
          nombre: producto.nombre,
          cantidad: config.cantidad,
          precioUnit: producto.precioUnit,
          motivo: config.motivo,
          metodo: config.metodo,
          estado: config.estado
        }));
      });

    if (productosDevueltosData.length > 0) {
      const estadoCalculado = calculateGeneralStatus(productosDevueltosData, false);
      setEstadoGral(estadoCalculado);
    }
  }, [seleccionados]);

  const validateField = (name, value) => {
    if (isEdit) return '';
    
    switch (name) {
      case 'noFactura':
        if (!value || !value.trim()) return 'El número de factura es obligatorio';
        return '';
      case 'cliente':
        if (!value || !value.trim()) return 'El nombre del cliente es obligatorio';
        if (value.trim().length < 2) return 'Debe tener al menos 2 caracteres';
        return '';
      case 'asesor':
        if (!value || !value.trim()) return 'El nombre del asesor es obligatorio';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras';
        return '';
      case 'direccion':
        if (domicilio) {
          if (!value || !value.trim()) return 'La dirección es obligatoria';
          if (value.trim().length < 5) return 'Debe tener al menos 5 caracteres';
        }
        return '';
      case 'evidencias':
        // Las evidencias solo son obligatorias si domicilio es true
        if (domicilio) {
          if (!value || value.length === 0) return 'Debe adjuntar al menos una evidencia cuando requiere domicilio';
        }
        return '';
      default:
        return '';
    }
  };

  const validateProductos = () => {
    if (isEdit) return '';
    
    const productosConConfigs = Object.entries(seleccionados)
      .filter(([_, configs]) => configs && configs.length > 0)
      .map(([id, configs]) => ({ id: Number(id), configs }));

    if (productosConConfigs.length === 0) {
      return 'Debe seleccionar al menos un producto';
    }
    
    for (const { id, configs } of productosConConfigs) {
      const producto = PRODUCTOS_VENTA.find(p => p.id === id);
      
      for (const config of configs) {
        if (!config.motivo) {
          return `Falta motivo en una configuración de ${producto.nombre}`;
        }
        if (!config.metodo) {
          return `Falta método en una configuración de ${producto.nombre}`;
        }
      }
    }
    
    return '';
  };

  const handleFieldChange = (field, value) => {
    if (isEdit) return;
    
    switch (field) {
      case 'noFactura': setNoFactura(value); break;
      case 'cliente': setCliente(value); break;
      case 'asesor': setAsesor(value); break;
      case 'direccion': setDireccion(value); break;
      case 'descripcion': setDescripcion(value); break;
      default: break;
    }
    
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    if (isEdit) return;
    
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value;
    switch (field) {
      case 'noFactura': value = noFactura; break;
      case 'cliente': value = cliente; break;
      case 'asesor': value = asesor; break;
      case 'direccion': value = direccion; break;
      default: value = '';
    }
    
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleEvidenceChange = (files) => {
    if (isEdit) return;
    
    setEvidencias(files);
    if (touched.evidencias) {
      const err = validateField('evidencias', files);
      setErrors(prev => ({ ...prev, evidencias: err }));
    }
  };

  const toggleProducto = (prod) => {
    if (isEdit) return;
    
    setSeleccionados((prev) => {
      if (prev[prod.id]) {
        const next = { ...prev };
        delete next[prod.id];
        return next;
      }
      return {
        ...prev,
        [prod.id]: [
          {
            id: generateTempId(),
            motivo: '',
            estado: 'Pendiente',
            metodo: '',
            cantidad: 1
          }
        ]
      };
    });
    
    setTimeout(() => {
      const prodError = validateProductos();
      setErrors(prev => ({ ...prev, productos: prodError }));
    }, 0);
  };

  const updateConfigs = (id, nuevasConfigs) => {
    if (isEdit) return;
    
    setSeleccionados((prev) => ({
      ...prev,
      [id]: nuevasConfigs
    }));
    
    setTimeout(() => {
      const prodError = validateProductos();
      setErrors(prev => ({ ...prev, productos: prodError }));
    }, 0);
  };

  const updateConfigsEditMode = (id, nuevasConfigs) => {
    setSeleccionados((prev) => ({
      ...prev,
      [id]: nuevasConfigs
    }));
  };

  const toggleAll = () => {
    if (isEdit) return;
    
    if (Object.keys(seleccionados).length === PRODUCTOS_VENTA.length) {
      setSeleccionados({});
    } else {
      const all = {};
      PRODUCTOS_VENTA.forEach((p) => {
        all[p.id] = seleccionados[p.id] || [
          {
            id: generateTempId(),
            motivo: '',
            estado: 'Pendiente',
            metodo: '',
            cantidad: 1
          }
        ];
      });
      setSeleccionados(all);
    }
    
    setTimeout(() => {
      const prodError = validateProductos();
      setErrors(prev => ({ ...prev, productos: prodError }));
    }, 0);
  };

  const productosDevueltos = Object.entries(seleccionados)
    .filter(([_, configs]) => configs && configs.length > 0)
    .map(([id, configs]) => ({
      producto: PRODUCTOS_VENTA.find(p => p.id === Number(id)),
      configs
    }));

  const totalUnidades = productosDevueltos.reduce((acc, { configs }) => {
    return acc + configs.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0);
  }, 0);

  const totalValor = productosDevueltos.reduce((acc, { producto, configs }) => {
    const productTotal = configs.reduce((sum, cfg) => {
      return sum + (cfg.cantidad || 0) * producto.precioUnit;
    }, 0);
    return acc + productTotal;
  }, 0);

  const validateForm = () => {
    const newErrors = {};
    
    if (!isEdit) {
      newErrors.noFactura = validateField('noFactura', noFactura);
      newErrors.cliente = validateField('cliente', cliente);
      newErrors.asesor = validateField('asesor', asesor);
      if (domicilio) {
        newErrors.direccion = validateField('direccion', direccion);
      }
      newErrors.evidencias = validateField('evidencias', evidencias);
      newErrors.productos = validateProductos();
    }
    
    return newErrors;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    
    if (isEdit) {
      const productosDevueltosData = [];
      
      Object.entries(seleccionados).forEach(([id, configs]) => {
        const producto = PRODUCTOS_VENTA.find(p => p.id === Number(id));
        configs.forEach((config, idx) => {
          productosDevueltosData.push({
            id: producto.id,
            configId: config.id,
            nombre: producto.nombre,
            cantidad: config.cantidad,
            precioUnit: producto.precioUnit,
            motivo: config.motivo,
            descripcionMotivo: config.descripcionMotivo || '',
            metodo: config.metodo,
            estado: config.estado
          });
        });
      });

      // En edición, el estado general se usa del selector, pero podría calcularse automáticamente
      const updatedData = {
        ...returnData,
        estado: estadoGral,
        estadoGral: estadoGral,
        productosDevueltos: productosDevueltosData,
        updatedAt: new Date().toISOString()
      };
      
      onSave?.(updatedData);
      onClose?.();
      return;
    }
    
    setTouched({
      noFactura: true,
      cliente: true,
      asesor: true,
      direccion: domicilio,
      evidencias: domicilio // Solo validar evidencias si domicilio es true
    });
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(error => error && error.length > 0);
    
    if (hasErrors) {
      showError('Errores en el formulario', 'Por favor corrija los errores antes de continuar');
      return;
    }

    const productosDevueltosData = [];
    
    Object.entries(seleccionados).forEach(([id, configs]) => {
      const producto = PRODUCTOS_VENTA.find(p => p.id === Number(id));
      configs.forEach((config, idx) => {
        productosDevueltosData.push({
          id: producto.id,
          configId: config.id,
          nombre: producto.nombre,
          cantidad: config.cantidad,
          precioUnit: producto.precioUnit,
          motivo: config.motivo,
          descripcionMotivo: config.descripcionMotivo || '',
          metodo: config.metodo,
          estado: config.estado
        });
      });
    });

    const evidenciasLimpia = evidencias.map(ev => {
      const { base64, ...evidenciaSinBase64 } = ev;
      return evidenciaSinBase64;
    });

    // Calcular automáticamente el estado general basado en los estados de los productos
    const estadoGeneralCalculado = calculateGeneralStatus(productosDevueltosData, false);

    const returnDataToSave = {
      noFactura,
      numeroFactura: noFactura,
      cliente,
      motivo: productosDevueltosData[0]?.motivo || '',
      totalValor,
      // Estado general automático - NO se permite edición manual
      estadoGral: estadoGeneralCalculado,
      estado: estadoGeneralCalculado,
      asesor,
      domicilio,
      direccion: direccion || '',
      telefono: '',
      descripcion: descripcion || '',
      evidencias: evidenciasLimpia,
      productos: productosDevueltosData,
      productosDevueltos: productosDevueltosData,
      cantidadProductos: productosDevueltosData.length,
      totalUnidades
    };

    onSave?.(returnDataToSave);
    onClose?.();
  };

  const inputClass = (field) => {
    if (isEdit) return '';
    
    const hasError = errors[field] && (touched[field] || submitted);
    return `w-full border rounded-lg px-3 py-2 text-sm text-gray-500 outline-none placeholder-gray-300 transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  const renderError = (field) => {
    if (isEdit) return null;
    
    if ((touched[field] || submitted) && errors[field]) {
      return <p className="mt-0.5 text-xs text-red-600">{errors[field]}</p>;
    }
    return null;
  };

  if (!isOpen) return null;
  
  const estadoColor = { 
    'En Proceso': '#b45309',
    'Procesada': '#15803d', 
    'Anulado': '#dc2626'
  }[estadoGral] ?? '#b45309';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 1060, maxHeight: '92vh' }}>

        <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold text-[15px]">
            {isEdit ? `Editar devolución — ${returnData?.numeroDevolucion || ''}` : 'Nueva devolución'}
          </h2>
          {isEdit && (
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
              <span className="text-white text-[10px] font-medium">Modo edición: solo estados</span>
            </div>
          )}
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 divide-x divide-gray-200">

          {/* COL 1 - Datos generales */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto">
            {isEdit ? (
              <>
                <DisabledField label="No. Factura" value={noFactura} required />
                <div className="grid grid-cols-2 gap-2">
                  <DisabledField label="Cliente" value={cliente} required />
                  <DisabledField label="Atendió" value={asesor} required />
                </div>
                
                {/* Estado - READ ONLY en edición, se calcula automáticamente */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Estado<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={estadoGral} onChange={(e) => setEstadoGral(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#004D77] pr-8 font-semibold"
                      style={{ color: estadoColor }}
                      disabled={isEdit}>
                      {ESTADOS_P.map((e) => <option key={e} className="text-gray-800 font-normal">{e}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {isEdit && (
                    <p className="text-xs text-gray-400 mt-1">
                      Estado calculado automáticamente
                    </p>
                  )}
                </div>
                
                <DisabledEvidence count={evidencias.length} />
                <DisabledDeliveryToggle isDelivery={domicilio} />
                {domicilio && <DisabledField label="Dirección" value={direccion} required />}
                <DisabledTextarea label="Descripción" value={descripcion} />
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">No. Factura<span className="text-red-500">*</span></label>
                  <input
                    value={noFactura}
                    onChange={(e) => handleFieldChange('noFactura', e.target.value)}
                    onBlur={() => handleBlur('noFactura')}
                    placeholder="PMPE14988"
                    className={inputClass('noFactura')}
                  />
                  {renderError('noFactura')}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cliente<span className="text-red-500">*</span></label>
                    <input
                      value={cliente}
                      onChange={(e) => handleFieldChange('cliente', e.target.value)}
                      onBlur={() => handleBlur('cliente')}
                      placeholder="Fernando Bustamante"
                      className={inputClass('cliente')}
                    />
                    {renderError('cliente')}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Atendió<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={asesor}
                      onChange={(e) => handleFieldChange('asesor', e.target.value)}
                      onBlur={() => handleBlur('asesor')}
                      placeholder="Nombre del asesor"
                      className={inputClass('asesor')}
                    />
                    {renderError('asesor')}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Estado<span className="text-red-500">*</span></label>
                  <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-yellow-50 text-yellow-700 font-semibold">
                    En Proceso
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Se calcula automáticamente
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Evidencias
                    {domicilio && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <button type="button" onClick={() => setEvidenceOpen(true)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm flex items-center justify-between ${
                      errors.evidencias && (touched.evidencias || submitted)
                        ? 'border-red-500'
                        : 'border-gray-300 border-dashed hover:border-[#004D77]'
                    }`}>
                    <span className="text-xs text-gray-400">
                      {evidencias.length === 0 ? 'Adjunta evidencias' : `${evidencias.length} archivo(s) adjunto(s)`}
                    </span>
                    <Image className="w-4 h-4 text-gray-400" />
                  </button>
                  {renderError('evidencias')}
                  {!domicilio && (
                    <p className="text-xs text-gray-400 mt-1">
                      Opcional cuando no requiere domicilio
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Domicilio</span>
                  <button type="button" onClick={() => setDomicilio((p) => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${domicilio ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${domicilio ? 'left-[26px]' : 'left-0.5'}`} />
                    {domicilio && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white text-[9px] font-bold">✓</span>}
                  </button>
                </div>
                
                {domicilio && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => handleFieldChange('direccion', e.target.value)}
                      onBlur={() => handleBlur('direccion')}
                      placeholder="Calle, número, barrio"
                      className={inputClass('direccion')}
                    />
                    {renderError('direccion')}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Descripción</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Agrega una descripción" rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none focus:border-[#004D77] resize-none placeholder-gray-300" />
                </div>
              </>
            )}
          </div>

          {/* COL 2 - Selección de productos */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-w-0">
            <p className="text-sm font-bold text-gray-800 mb-0.5">1. Productos</p>
            <p className="text-xs text-gray-400 mb-3">Seleccione los productos que va a devolver</p>
            
            {!isEdit && (
              <label className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-3 cursor-pointer">
                <input type="checkbox" checked={Object.keys(seleccionados).length === PRODUCTOS_VENTA.length}
                  onChange={toggleAll} className="accent-[#004D77] w-3.5 h-3.5" />
                Seleccionar todos
              </label>
            )}
            
            {errors.productos && (submitted) && !isEdit && (
              <p className="mb-2 text-xs text-red-600">{errors.productos}</p>
            )}
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {PRODUCTOS_VENTA.map((prod) => {
                const isSelected = Boolean(seleccionados[prod.id] && seleccionados[prod.id].length > 0);
                return (
                  <div key={prod.id}>
                    {!isSelected ? (
                      <div onClick={() => !isEdit && toggleProducto(prod)}
                        className={`flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2.5 ${!isEdit ? 'cursor-pointer hover:border-gray-300 hover:bg-gray-50' : 'cursor-default bg-gray-50 opacity-70'} transition`}>
                        <input type="checkbox" checked={false} readOnly className="accent-[#004D77] w-4 h-4 cursor-pointer flex-shrink-0" />
                        <ProductoImg src={prod.imagen} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{prod.nombre}</p>
                          <p className="text-[11px] text-gray-500">Cantidad: {prod.cantidad}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-gray-400">Total</p>
                          <p className="text-xs font-bold text-gray-700">${formatCOP(prod.cantidad * prod.precioUnit)}</p>
                        </div>
                        {isEdit && (
                          <p className="text-xs text-gray-400 mt-1">
                            No se puede modificar en edición
                          </p>
                        )}
                      </div>
                    ) : isEdit ? (
                      <ProductoSeleccionadoEditMode
                        producto={prod}
                        configs={seleccionados[prod.id]}
                        onConfigChange={(nuevasConfigs) => updateConfigsEditMode(prod.id, nuevasConfigs)}
                        submitted={submitted}
                      />
                    ) : (
                      <ProductoSeleccionadoCreateMode
                        producto={prod}
                        configs={seleccionados[prod.id]}
                        onConfigsChange={(nuevasConfigs) => updateConfigs(prod.id, nuevasConfigs)}
                        onRemove={() => toggleProducto(prod)}
                        submitted={submitted}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COL 3 - Resumen y cálculo */}
          <div className="w-[280px] flex-shrink-0 flex flex-col p-4 overflow-hidden">
            <p className="text-sm font-bold text-gray-800 mb-0.5">2. Productos devueltos</p>
            <p className="text-xs text-gray-400 mb-3">Cantidad a devolver</p>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {productosDevueltos.length === 0 ? (
                <p className="text-xs text-gray-300 italic">Sin productos seleccionados</p>
              ) : (
                productosDevueltos.flatMap(({ producto, configs }) => 
                  configs.map((config, idx) => (
                    <div key={`${producto.id}-${idx}`} className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ProductoImg src={producto.imagen} size="sm" />
                        <div>
                          <span className="text-xs font-semibold text-gray-800 block truncate">{producto.nombre}</span>
                          <span className="text-[10px] text-gray-500">{config.motivo || 'Sin motivo'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
                        <span className="text-xs font-bold text-gray-800">{config.cantidad}</span>
                        <span className="text-[10px] text-gray-400">${formatCOP(config.cantidad * producto.precioUnit)}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
            
            <p className="text-sm font-bold text-gray-800 mb-0.5">3. Cálculo</p>
            <p className="text-xs text-gray-400 mb-2">Resumen de devolución</p>
            
            <div className="flex-1 overflow-y-auto min-h-0 mb-2">
              {productosDevueltos.length === 0 ? (
                <p className="text-xs text-gray-300 italic">—</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-1 text-gray-500 font-semibold">Producto</th>
                      <th className="text-center pb-1 text-gray-500 font-semibold">Cant</th>
                      <th className="text-center pb-1 text-gray-500 font-semibold">V Unit</th>
                      <th className="text-right pb-1 text-gray-500 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosDevueltos.flatMap(({ producto, configs }) => 
                      configs.map((config, idx) => (
                        <tr key={`${producto.id}-${idx}`} className="border-b border-gray-100">
                          <td className="py-1 text-gray-700 font-medium">{producto.nombre}</td>
                          <td className="py-1 text-center text-gray-600">{config.cantidad}</td>
                          <td className="py-1 text-center text-gray-600">{formatCOP(producto.precioUnit)}</td>
                          <td className="py-1 text-right text-gray-700 font-semibold">{formatCOP(config.cantidad * producto.precioUnit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-2 mt-2 flex-shrink-0">
              <div className="grid grid-cols-3 text-[10px] text-gray-500 font-semibold mb-1">
                <span>Número de<br/>Productos</span>
                <span className="text-center">Cantidad de<br/>Unidades</span>
                <span className="text-right">Total</span>
              </div>
              <div className="grid grid-cols-3 text-xs font-bold text-gray-800">
                <span>{productosDevueltos.length}</span>
                <span className="text-center">{totalUnidades}</span>
                <span className="text-right">${formatCOP(totalValor)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <button type="button" onClick={handleSubmit}
            className="flex-1 py-3 bg-[#004D77] hover:bg-[#003d61] text-white text-sm font-bold rounded-xl transition cursor-pointer">
            {isEdit ? 'Guardar cambios' : 'Agregar a devoluciones'}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-bold rounded-xl transition cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>

      {!isEdit && (
        <Evidence 
          isOpen={evidenceOpen} 
          onClose={() => setEvidenceOpen(false)}
          files={evidencias} 
          descripcion={descripcion}
          onSave={({ files, descripcion: desc }) => {
            setEvidencias(files);
            setDescripcion(desc);
            handleEvidenceChange(files);
          }} 
        />
      )}
    </div>
  );
}

export default FormReturn;