/**
 * Archivo: FormReturn.jsx
 * 
 * Formulario modal para crear o editar devoluciones de ventas.
 * Integra la selección de productos, captura de datos de cliente,
 * adjunción de evidencias y validación completa del formulario.
 * 
 * Responsabilidades principales:
 * - Formulario modal para crear/editar devoluciones
 * - Selección de productos con múltiples configuraciones
 * - Captura de datos del cliente, asesor e información de entrega
 * - Validación en tiempo real y al enviar
 * - Previsualización de resumen de devolución
 * - Adjunción y gestión de evidencias
 * - Cambio de estado general de la devolución
 * - Soporte para edición y creación de devoluciones
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronLeft, Minus, Plus, Image } from 'lucide-react';
import Evidence from './Evidence';
import { useAlert } from '../../../../shared/alerts/useAlert';

// ======================= DATOS DE REFERENCIA =======================

/**
 * Lista de productos disponibles para devolución.
 * Contiene estructura base con ID, nombre, cantidad disponible y precio.
 */
const PRODUCTOS_VENTA = [
  { id: 1, nombre: 'Libreta con lapicero',    cantidad: 1, precioUnit: 5000, imagen: null },
  { id: 2, nombre: 'Pincel #10',              cantidad: 6, precioUnit: 1200, imagen: null },
  { id: 3, nombre: 'Cosedora Xingli XL207 Y', cantidad: 3, precioUnit: 5000, imagen: null },
  { id: 4, nombre: 'Silicona liquida ET131 X', cantidad: 8, precioUnit: 2900, imagen: null },
];

// Opciones disponibles para motivos de devolución
const MOTIVOS    = ['Prod. en mal estado', 'Producto roto', 'Producto equivocado', 'Producto incompleto', 'No era el pedido'];
// Opciones disponibles para métodos de devolución
const METODOS    = ['Reembolso', 'Cambio de producto', 'Nota crédito'];
// Opciones de estados para la devolución general
const ESTADOS_P  = ['Pendiente', 'Aprobada', 'Anulada'];

// ======================= UTILIDADES =======================

/**
 * Formatea un número como moneda COP (Peso Colombiano).
 * @param {number} v - Valor a formatear
 * @returns {string} Valor formateado en notación local
 */
const formatCOP = (v) => new Intl.NumberFormat('es-CO').format(v);

// ======================= COMPONENTES AUXILIARES =======================

/**
 * Componente auxiliar para mostrar imagen de producto.
 * Muestra imagen cargada o placeholder genérico.
 * 
 * @param {Object} props - Props
 * @param {string} props.src - URL de la imagen
 * @param {string} props.size - Tamaño ('sm' o 'md')
 * @returns {JSX.Element} Imagen o placeholder
 */
function ProductoImg({ src, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (src) return <img src={src} alt="" className={`${dim} rounded-lg object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
      <Image className="w-4 h-4 text-gray-300" />
    </div>
  );
}

/**
 * Selector visual de estado con badge de color.
 * Muestra dropdown con opciones de estado disponibles.
 * 
 * @param {Object} props - Props
 * @param {string} props.value - Estado actual
 * @param {Function} props.onChange - Callback al cambiar
 * @returns {JSX.Element} Selector con badge
 */
function EstadoBadgeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const color = {
    Pendiente: 'bg-red-100 text-red-600 border-red-300',
    Aprobada:  'bg-green-100 text-green-700 border-green-300',
    Anulada:   'bg-gray-100 text-gray-500 border-gray-300',
  }[value] ?? 'bg-red-100 text-red-600 border-red-300';
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${color}`}>
        {value}<ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
          {ESTADOS_P.map((e) => (
            <button key={e} type="button" onClick={() => { onChange(e); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================= FUNCIONALIDAD: GENERAR IDS =======================

/**
 * Genera un ID temporal único para configuraciones.
 * Se usa mientras están en edición del formulario.
 * @returns {number} ID temporal
 */
const generateTempId = () => Date.now() + Math.random();

// ======================= COMPONENTE: PRODUCTO SELECCIONADO =======================

/**
 * Componente para mostrar un producto seleccionado con múltiples configuraciones.
 * Soporta expansión/colapsación, validación de campos,
 * y gestión de varias configuraciones del mismo producto.
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {Object} props.producto - Datos del producto
 * @param {Array} props.configs - Array de configuraciones actuales
 * @param {Function} props.onConfigsChange - Callback al cambiar configuraciones
 * @param {Function} props.onRemove - Callback para deseleccionar producto
 * @param {boolean} props.submitted - Indica si fue enviado
 * @returns {JSX.Element} Card del producto
 */
function ProductoSeleccionado({ producto, configs, onConfigsChange, onRemove, submitted }) {
  // ======================= ESTADOS =======================
  
  // Estado para controlar si el card está expandido
  const [expanded, setExpanded] = useState(true);
  // Rastrear campos tocados para validación
  const [touched, setTouched] = useState({});
  // Cantidad máxima del producto disponible para devolver
  const maxTotalQuantity = producto.cantidad;

  // Calcular cantidad total usada
  const totalQuantityUsed = configs.reduce((sum, cfg) => sum + (cfg.cantidad || 0), 0);
  const remainingQuantity = maxTotalQuantity - totalQuantityUsed;

  const validateField = (name, value) => {
    if (name === 'motivo' && (!value || !value.trim())) return 'Seleccione el motivo de la devolución';
    if (name === 'metodo' && (!value || !value.trim())) return 'Seleccione el método de devolución';
    return '';
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
      estado: 'Pendiente',
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
    <div className={`border rounded-xl overflow-hidden transition-colors border-gray-300`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f1f1f1]">
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0"
          title={expanded ? 'Colapsar' : 'Expandir'}>
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

      {/* Formulario expandido - Múltiples configuraciones */}
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
                    {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {renderConfigError(index, 'motivo', config.motivo)}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estado<span className="text-red-500">*</span>
                  </label>
                  <EstadoBadgeSelect 
                    value={config.estado} 
                    onChange={(v) => handleConfigChange(index, 'estado', v)} 
                  />
                </div>

                {/* Método devolución */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Metodo devolución<span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={config.metodo}
                    onChange={(e) => handleConfigChange(index, 'metodo', e.target.value)}
                    onBlur={() => handleConfigBlur(index, 'metodo')}
                    className={configFieldClass(index, 'metodo', config.metodo)}>
                    <option value="">Selecciona una opción</option>
                    {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {renderConfigError(index, 'metodo', config.metodo)}
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
            </div>
          ))}

          {/* Botón para agregar nueva configuración */}
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

// ======================= COMPONENTE PRINCIPAL: FORM RETURN =======================

/**
 * Componente: FormReturn
 * 
 * Modal principal para crear o editar una devolución.
 * Integra selección de productos, datos de cliente, evidencias y validación.
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar
 * @param {Object|null} props.returnData - Datos para edición (null para crear)
 * @param {Function} props.onSave - Callback al guardar la devolución
 * 
 * @returns {JSX.Element|null} Modal del formulario o null si está cerrado
 */
function FormReturn({ isOpen, onClose, returnData = null, onSave }) {
  // Determinar si es edición o creación
  const isEdit = Boolean(returnData);

  // ======================= ESTADOS PRINCIPALES =======================
  
  // Datos de factura
  const [noFactura,    setNoFactura]    = useState('');
  // Datos del cliente
  const [cliente,      setCliente]      = useState('');
  // Nombre del asesor que atiende
  const [asesor,       setAsesor]       = useState('');
  // Estado general de la devolución
  const [estadoGral,   setEstadoGral]   = useState('Pendiente');
  // Array de evidencias adjuntas
  const [evidencias,   setEvidencias]   = useState([]);
  // Controla visibilidad del modal de evidencias
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  // Si se requiere envío a domicilio
  const [domicilio,    setDomicilio]    = useState(true);
  // Dirección de entrega
  const [direccion,    setDireccion]    = useState('');
  // Descripción adicional de la devolución
  const [descripcion,  setDescripcion]  = useState('');
  // Productos seleccionados con sus configuraciones
  const [seleccionados, setSeleccionados] = useState({});
  // Indica si el formulario fue enviado
  const [submitted,    setSubmitted]    = useState(false);

  // ======================= ESTADOS DE VALIDACIÓN =======================
  
  // Errores por campo
  const [errors, setErrors] = useState({
    noFactura: '',
    cliente: '',
    asesor: '',
    direccion: '',
    evidencias: '',
    productos: ''
  });
  // Campos que han sido tocados (para mostrar errores)
  const [touched, setTouched] = useState({
    noFactura: false,
    cliente: false,
    asesor: false,
    direccion: false,
    evidencias: false
  });

  // Hook para mostrar alertas
  const { showError } = useAlert();

  // ======================= USEEFFECT: CARGAR DATOS =======================
  
  // Se ejecuta cuando se abre el modal o hay cambio en returnData
  // Carga datos si es edición o limpia el formulario si es creación
  useEffect(() => {
    if (returnData) {
      setNoFactura(returnData.numeroFactura ?? returnData.noFactura ?? '');
      setCliente(returnData.cliente ?? '');
      setAsesor(returnData.asesor ?? '');
      setEstadoGral(returnData.estado ?? 'Pendiente');
      setDescripcion(returnData.descripcion ?? '');
      setDomicilio(returnData.domicilio ?? true);
      setDireccion(returnData.direccion ?? '');
      setEvidencias(returnData.evidencias ?? []);
      
      // Cargar productos seleccionados si existen
      const seleccionadosIniciales = {};
      if (returnData.productosDevueltos) {
        returnData.productosDevueltos.forEach(p => {
          if (!seleccionadosIniciales[p.id]) {
            seleccionadosIniciales[p.id] = [];
          }
          seleccionadosIniciales[p.id].push({
            id: p.configId || generateTempId(),
            motivo: p.motivo || '',
            estado: p.estado || 'Pendiente',
            metodo: p.metodo || '',
            cantidad: p.cantidad || 1
          });
        });
      }
      setSeleccionados(seleccionadosIniciales);
    } else {
      setNoFactura(''); setCliente(''); setAsesor('');
      setEstadoGral('Pendiente'); setEvidencias([]);
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

  // ======================= USEEFFECT: LIMPIAR ERROR DIRECCIÓN =======================
  
  // Se ejecuta cuando cambia el estado de domicilio
  // Limpia error de dirección si se desactiva el domicilio
  useEffect(() => {
    if (!domicilio) {
      setErrors(prev => ({ ...prev, direccion: '' }));
      setTouched(prev => ({ ...prev, direccion: false }));
    }
  }, [domicilio]);

  // ======================= FUNCIONALIDAD: VALIDACIÓN =======================
  
  /**
   * Valida un campo individual del formulario.
   * Aplica reglas específicas según el tipo de campo.
   * @param {string} name - Nombre del campo a validar
   * @param {*} value - Valor del campo
   * @returns {string} Mensaje de error (vacío si es válido)
   */
  const validateField = (name, value) => {
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
        if (!value || value.length === 0) return 'Debe adjuntar al menos una evidencia';
        return '';
      default:
        return '';
    }
  };

  /**
   * Valida que los productos seleccionados tengan configuraciones válidas.
   * Verifica que cada configuración tenga motivo y método.
   * @returns {string} Mensaje de error o vacío si es válido
   */
  const validateProductos = () => {
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

  // ======================= FUNCIONALIDAD: MANEJO DE CAMBIOS =======================
  
  /**
   * Maneja cambios en campos con validación en tiempo real.
   * @param {string} field - Nombre del campo
   * @param {*} value - Nuevo valor
   */
  const handleFieldChange = (field, value) => {
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

  /**
   * Maneja evento blur (salida del campo).
   * Marca el campo como tocado y valida.
   * @param {string} field - Nombre del campo
   */
  const handleBlur = (field) => {
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

  /**
   * Maneja cambios en las evidencias adjuntas.
   * @param {Array} files - Array de archivos adjuntos
   */
  const handleEvidenceChange = (files) => {
    setEvidencias(files);
    if (touched.evidencias) {
      const err = validateField('evidencias', files);
      setErrors(prev => ({ ...prev, evidencias: err }));
    }
  };

  // ======================= FUNCIONALIDAD: SELECCIÓN DE PRODUCTOS =======================
  
  /**
   * Alterna selección de un producto individual.
   * Crea la configuración inicial si no existe.
   * @param {Object} prod - Producto a alternar
   */
  const toggleProducto = (prod) => {
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

  /**
   * Actualiza las configuraciones de un producto.
   * @param {number} id - ID del producto
   * @param {Array} nuevasConfigs - Nuevo array de configuraciones
   */
  const updateConfigs = (id, nuevasConfigs) => {
    setSeleccionados((prev) => ({
      ...prev,
      [id]: nuevasConfigs
    }));
    
    setTimeout(() => {
      const prodError = validateProductos();
      setErrors(prev => ({ ...prev, productos: prodError }));
    }, 0);
  };

  /**
   * Alterna selección de todos los productos.
   */
  const toggleAll = () => {
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

  // ======================= CÓMPUTO DE TOTALES =======================
  
  /**
   * Calcula productos devueltos con todas sus configuraciones.
   */
  // MODIFICADO: Calcular productos devueltos con múltiples configuraciones
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

  /**
   * Valida todo el formulario.
   * @returns {Object} Objeto con errores por campo
   */
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.noFactura = validateField('noFactura', noFactura);
    newErrors.cliente = validateField('cliente', cliente);
    newErrors.asesor = validateField('asesor', asesor);
    if (domicilio) {
      newErrors.direccion = validateField('direccion', direccion);
    }
    newErrors.evidencias = validateField('evidencias', evidencias);
    newErrors.productos = validateProductos();
    
    return newErrors;
  };

  // ======================= FUNCIONALIDAD: ENVIAR =======================
  
  /**
   * Maneja el envío del formulario.
   * Valida todos los campos y enviar datos o mostrar errores.
   */
  const handleSubmit = () => {
    setSubmitted(true);
    
    setTouched({
      noFactura: true,
      cliente: true,
      asesor: true,
      direccion: domicilio,
      evidencias: true
    });
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(error => error && error.length > 0);
    
    if (hasErrors) {
      showError('Errores en el formulario', 'Por favor corrija los errores antes de continuar');
      return;
    }

    // MODIFICADO: Construir productos devueltos con todas las configuraciones
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
          metodo: config.metodo,
          estado: config.estado
        });
      });
    });

    const evidenciasLimpia = evidencias.map(ev => {
      const { base64, ...evidenciaSinBase64 } = ev;
      return evidenciaSinBase64;
    });

    const returnDataToSave = {
      noFactura,
      numeroFactura: noFactura,
      cliente,
      motivo: productosDevueltosData[0]?.motivo || '',
      totalValor,
      estadoGral,
      estado: estadoGral,
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

    if (isEdit && returnData) {
      returnDataToSave.id = returnData.id;
      returnDataToSave.numeroDevolucion = returnData.numeroDevolucion;
      returnDataToSave.fechaCreacion = returnData.fechaCreacion;
    }

    onSave?.(returnDataToSave);
    onClose?.();
  };

  // ======================= UTILIDADES PARA RENDERIZADO =======================
  
  /**
   * Retorna clases CSS para input según estado de validación.
   * @param {string} field - Nombre del campo
   * @returns {string} Clases Tailwind
   */
  const inputClass = (field) => {
    const hasError = errors[field] && (touched[field] || submitted);
    return `w-full border rounded-lg px-3 py-2 text-sm text-gray-500 outline-none placeholder-gray-300 transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  /**
   * Renderiza el mensaje de error de un campo si existe.
   * @param {string} field - Nombre del campo
   * @returns {JSX.Element|null} Elemento de error o null
   */
  const renderError = (field) => {
    if ((touched[field] || submitted) && errors[field]) {
      return <p className="mt-0.5 text-xs text-red-600">{errors[field]}</p>;
    }
    return null;
  };

  // Validar si el modal debe mostrarse
  if (!isOpen) return null;
  
  // ======================= CÓMPUTO DE COLORES =======================
  
  // Determinar color del estado para visualización
  const estadoColor = { 
    Pendiente: '#dc2626', 
    Aprobada: '#15803d', 
    Anulada: '#6b7280' 
  }[estadoGral] ?? '#dc2626';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 1060, maxHeight: '92vh' }}>

        {/* Header del modal */}
        <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold text-[15px]">
            {isEdit ? `Editar devolución — ${returnData?.numeroDevolucion || ''}` : 'Nueva devolución'}
          </h2>
          {/* Botón para cerrar el modal */}
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 divide-x divide-gray-200">

          {/* COL 1 - Datos generales */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto">
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
              <div className="relative">
                <select value={estadoGral} onChange={(e) => setEstadoGral(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#004D77] pr-8 cursor-pointer font-semibold"
                  style={{ color: estadoColor }}>
                  {ESTADOS_P.map((e) => <option key={e} className="text-gray-800 font-normal">{e}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Evidencias<span className="text-red-500">*</span></label>
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
          </div>

          {/* COL 2 - Selección de productos */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-w-0">
            <p className="text-sm font-bold text-gray-800 mb-0.5">1. Productos</p>
            <p className="text-xs text-gray-400 mb-3">Seleccione los productos que va a devolver</p>
            
            <label className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-3 cursor-pointer">
              <input type="checkbox" checked={Object.keys(seleccionados).length === PRODUCTOS_VENTA.length}
                onChange={toggleAll} className="accent-[#004D77] w-3.5 h-3.5" />
              Seleccionar todos
            </label>
            
            {errors.productos && (submitted) && (
              <p className="mb-2 text-xs text-red-600">{errors.productos}</p>
            )}
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {PRODUCTOS_VENTA.map((prod) => {
                const isSelected = Boolean(seleccionados[prod.id] && seleccionados[prod.id].length > 0);
                return (
                  <div key={prod.id}>
                    {!isSelected ? (
                      <div onClick={() => toggleProducto(prod)}
                        className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition">
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
                      </div>
                    ) : (
                      <ProductoSeleccionado
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
    </div>
  );
}

export default FormReturn;