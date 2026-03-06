import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronLeft, Minus, Plus, Image } from 'lucide-react';
import Evidence from './Evidence';
import { useAlert } from '../../../shared/alerts/useAlert';

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
const PRODUCTOS_VENTA = [
  { id: 1, nombre: 'Libreta con lapicero',    cantidad: 1, precioUnit: 5000, imagen: null },
  { id: 2, nombre: 'Pincel #10',              cantidad: 6, precioUnit: 1200, imagen: null },
  { id: 3, nombre: 'Cosedora Xingli XL207 Y', cantidad: 3, precioUnit: 5000, imagen: null },
  { id: 4, nombre: 'Silicona liquida ET131 X', cantidad: 8, precioUnit: 2900, imagen: null },
];

const MOTIVOS    = ['Prod. en mal estado', 'Producto roto', 'Producto equivocado', 'Producto incompleto', 'No era el pedido'];
const METODOS    = ['Reembolso', 'Cambio de producto', 'Nota crédito'];
const ESTADOS_P  = ['Pendiente', 'Aprobada', 'Anulada'];
const ASESORES   = ['Valentina Ocampo', 'Maria Gómez', 'Carlos Ruiz', 'Sofía Vargas'];
const DIRECCIONES = ['Cra 73 #21-30 (Belén San Bernardo - 1er piso)', 'Calle 50 #45-12 (El Poblado)', 'Av. El Dorado #68-95'];

const formatCOP = (v) => new Intl.NumberFormat('es-CO').format(v);

function ProductoImg({ src, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (src) return <img src={src} alt="" className={`${dim} rounded-lg object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
      <Image className="w-4 h-4 text-gray-300" />
    </div>
  );
}

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

// ─── CAMBIOS SOLO AQUÍ: flecha colapsa/expande + validaciones FormProvider ────
function ProductoSeleccionado({ producto, config, onConfigChange, onRemove, submitted }) {
  const [expanded, setExpanded] = useState(true);
  const [touched,  setTouched]  = useState({});
  const max    = producto.cantidad;
  const setQty = (v) => onConfigChange({ ...config, cantidad: Math.max(1, Math.min(max, v)) });

  const validateField = (name, value) => {
    if (name === 'motivo' && (!value || !value.trim())) return 'Seleccione el motivo de la devolución';
    if (name === 'metodo' && (!value || !value.trim())) return 'Seleccione el método de devolución';
    return '';
  };

  const handleChange = (name, value) => {
    onConfigChange({ ...config, [name]: value });
    if (touched[name]) {
      // valida en tiempo real si ya tocó el campo
    }
  };

  const handleBlur = (name) => setTouched((p) => ({ ...p, [name]: true }));

  const renderError = (name) => {
    const show = touched[name] || submitted;
    const err  = validateField(name, config[name]);
    if (!show || !err) return null;
    return <p className="mt-0.5 text-xs text-red-600">{err}</p>;
  };

  const fieldClass = (name) => {
    const show     = touched[name] || submitted;
    const hasError = show && validateField(name, config[name]);
    return `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors cursor-pointer ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  const cardHasError = (submitted || Object.keys(touched).length > 0) &&
    (validateField('motivo', config.motivo) || validateField('metodo', config.metodo));

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${cardHasError ? 'border-red-300' : 'border-gray-300'}`}>

      {/* Header — idéntico al original, solo la flecha cambia de comportamiento */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f1f1f1]">
        {/* Flecha: SOLO colapsa/expande, NO desselecciona */}
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0"
          title={expanded ? 'Colapsar' : 'Expandir'}>
          <ChevronLeft className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
        </button>
        {/* Checkbox: desselecciona */}
        <input type="checkbox" checked readOnly
          className="accent-[#004D77] w-4 h-4 cursor-pointer flex-shrink-0"
          onClick={onRemove} />
        <ProductoImg src={producto.imagen} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{producto.nombre}</p>
          <p className="text-[11px] text-gray-500">Cantidad: {producto.cantidad}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-xs font-bold text-gray-700">${formatCOP(producto.cantidad * producto.precioUnit)}</p>
        </div>
      </div>

      {/* Formulario: fondo blanco, estilo FormProvider, datos guardados aunque esté colapsado */}
      {expanded && (
        <div className="bg-white px-3 py-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">

            {/* Motivo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Motivo<span className="text-red-500">*</span>
              </label>
              <select value={config.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                onBlur={() => handleBlur('motivo')}
                className={fieldClass('motivo')}>
                <option value="">Selecciona una opción</option>
                {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {renderError('motivo')}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Estado<span className="text-red-500">*</span>
              </label>
              <EstadoBadgeSelect value={config.estado} onChange={(v) => handleChange('estado', v)} />
            </div>

            {/* Método devolución */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Metodo devolución<span className="text-red-500">*</span>
              </label>
              <select value={config.metodo}
                onChange={(e) => handleChange('metodo', e.target.value)}
                onBlur={() => handleBlur('metodo')}
                className={fieldClass('metodo')}>
                <option value="">Selecciona una opción</option>
                {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {renderError('metodo')}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cantidad<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setQty(config.cantidad - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition">
                  <Minus className="w-3 h-3" />
                </button>
                <input type="number" value={config.cantidad} min={1} max={max}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-10 text-center border border-gray-300 rounded-lg px-1 py-1.5 text-sm text-gray-700 outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20" />
                <button type="button" onClick={() => setQty(config.cantidad + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition">
                  <Plus className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-gray-400">Max. {max}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal — SIN CAMBIOS ──────────────────────────────────────
function FormReturn({ isOpen, onClose, devolucion = null, onSave }) {
  const isEdit = Boolean(devolucion);

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

  // validation state
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const { showError } = useAlert();

  useEffect(() => {
    if (devolucion) {
      setNoFactura(devolucion.noFactura ?? '');
      setCliente(devolucion.cliente ?? '');
      setAsesor(devolucion.asesor ?? '');
      setEstadoGral(devolucion.estado ?? 'Pendiente');
      setDescripcion(devolucion.descripcion ?? '');
      setEvidencias([]);
    } else {
      setNoFactura(''); setCliente(''); setAsesor('');
      setEstadoGral('Pendiente'); setEvidencias([]);
      setDomicilio(true); setDireccion('');
      setDescripcion(''); setSeleccionados({});
    }
    setSubmitted(false);
  }, [devolucion, isOpen]);

  useEffect(() => {
    if (!domicilio) {
      setErrors((p) => {
        const { direccion, ...rest } = p;
        return rest;
      });
      setTouched((p) => {
        const { direccion, ...rest } = p;
        return rest;
      });
    }
  }, [domicilio]);

  const toggleProducto = (prod) => {
    setSeleccionados((prev) => {
      if (prev[prod.id]) { const next = { ...prev }; delete next[prod.id]; return next; }
      return { ...prev, [prod.id]: { motivo: '', estado: 'Pendiente', metodo: '', cantidad: 1 } };
    });
  };
  const updateConfig = (id, cfg) => setSeleccionados((prev) => ({ ...prev, [id]: cfg }));
  const toggleAll = () => {
    if (Object.keys(seleccionados).length === PRODUCTOS_VENTA.length) { setSeleccionados({}); }
    else {
      const all = {};
      PRODUCTOS_VENTA.forEach((p) => { all[p.id] = seleccionados[p.id] ?? { motivo: '', estado: 'Pendiente', metodo: '', cantidad: 1 }; });
      setSeleccionados(all);
    }
  };

  const productosDevueltos = PRODUCTOS_VENTA.filter((p) => seleccionados[p.id]);
  const totalUnidades = productosDevueltos.reduce((acc, p) => acc + (seleccionados[p.id]?.cantidad ?? 0), 0);
  const totalValor    = productosDevueltos.reduce((acc, p) => acc + (seleccionados[p.id]?.cantidad ?? 0) * p.precioUnit, 0);

  // single-field validator
  const validateField = (name, value) => {
    switch (name) {
      case 'noFactura':
        if (!value.trim()) return 'El número de factura es obligatorio';
        break;
      case 'cliente':
        if (!value.trim()) return 'El nombre del cliente es obligatorio';
        if (value.trim().length < 2) return 'Debe tener al menos 2 caracteres';
        break;
      case 'asesor':
        if (!value.trim()) return 'El nombre del asesor es obligatorio';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras';
        break;
      case 'direccion':
        if (domicilio) {
          if (!value.trim()) return 'La dirección es obligatoria';
          if (value.trim().length < 5) return 'Debe tener al menos 5 caracteres';
        }
        break;
      case 'evidencias':
        if (evidencias.length === 0) return 'Debe adjuntar al menos una evidencia';
        break;
      default:
        break;
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    ['noFactura', 'cliente', 'asesor', ...(domicilio ? ['direccion'] : []), 'evidencias'].forEach((field) => {
      const val = { noFactura, cliente, asesor, direccion, evidencias }[field];
      const err = validateField(field, val);
      if (err) newErrors[field] = err;
    });
    return newErrors;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateForm();
    setErrors(validationErrors);
    setTouched(
      ['noFactura', 'cliente', 'asesor', 'direccion', 'evidencias'].reduce((acc, f) => ({ ...acc, [f]: true }), {})
    );

    if (Object.keys(validationErrors).length > 0) {
      showError('Errores en el formulario', 'Por favor corrija los errores antes de continuar');
      return;
    }

    const prodInvalidos = productosDevueltos.some((p) => { const c = seleccionados[p.id]; return !c.motivo || !c.metodo; });
    if (prodInvalidos || productosDevueltos.length === 0) return;
    onSave?.({ noFactura, cliente, asesor, estadoGral, evidencias, domicilio, direccion, descripcion,
      productos: productosDevueltos.map((p) => ({ ...p, ...seleccionados[p.id] })) });
    onClose?.();
  };

  // helper utils for styling and interaction
  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-500 outline-none placeholder-gray-300 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const renderError = (field) =>
    errors[field] && touched[field] && (
      <p className="mt-0.5 text-xs text-red-600">{errors[field]}</p>
    );

  const handleFieldChange = (field, value) => {
    switch (field) {
      case 'noFactura': setNoFactura(value); break;
      case 'cliente': setCliente(value); break;
      case 'asesor': setAsesor(value); break;
      case 'direccion': setDireccion(value); break;
      case 'descripcion': setDescripcion(value); break;
      case 'evidencias': setEvidencias(value); break;
      default: break;
    }
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((p) => ({ ...p, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const err = validateField(field, { noFactura, cliente, asesor, direccion, evidencias }[field]);
    setErrors((p) => ({ ...p, [field]: err }));
  };

  if (!isOpen) return null;
  const estadoColor = { Pendiente: '#dc2626', Aprobada: '#15803d', Anulada: '#6b7280' }[estadoGral] ?? '#dc2626';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 1060, maxHeight: '92vh' }}>

        <div className="bg-[#004D77] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold text-[15px]">
            {isEdit ? `Editar devolución — ${devolucion.devolucion}` : 'Nueva devolución'}
          </h2>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 divide-x divide-gray-200">

          {/* COL 1 */}
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
                  placeholder="Fernando Bustamante Ramirez"
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
                className={inputClass('evidencias') + ' flex items-center justify-between border-dashed'}>
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
                {domicilio && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white text-[9px] font-bold">$</span>}
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

          {/* COL 2 */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-w-0">
            <p className="text-sm font-bold text-gray-800 mb-0.5">1. Productos</p>
            <p className="text-xs text-gray-400 mb-3">Seleccione los productos que va a devolver</p>
            <label className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-3 cursor-pointer">
              <input type="checkbox" checked={Object.keys(seleccionados).length === PRODUCTOS_VENTA.length}
                onChange={toggleAll} className="accent-[#000000] w-3.5 h-3.5" />
              Seleccionar todos
            </label>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {PRODUCTOS_VENTA.map((prod) => {
                const isSelected = Boolean(seleccionados[prod.id]);
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
                        config={seleccionados[prod.id]}
                        onConfigChange={(cfg) => updateConfig(prod.id, cfg)}
                        onRemove={() => toggleProducto(prod)}
                        submitted={submitted}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COL 3 */}
          <div className="w-[280px] flex-shrink-0 flex flex-col p-4 overflow-hidden">
            <p className="text-sm font-bold text-gray-800 mb-0.5">2. Productos devueltos</p>
            <p className="text-xs text-gray-400 mb-3">Digite la cantidad que se va a devolver</p>
            <div className="space-y-2 mb-4">
              {productosDevueltos.length === 0 ? (
                <p className="text-xs text-gray-300 italic">Sin productos seleccionados</p>
              ) : (
                productosDevueltos.map((prod) => {
                  const cfg = seleccionados[prod.id];
                  return (
                    <div key={prod.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ProductoImg src={prod.imagen} size="sm" />
                        <span className="text-xs font-semibold text-gray-800 truncate">{prod.nombre}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
                        <div className="flex items-center">
                          <button type="button" onClick={() => updateConfig(prod.id, { ...cfg, cantidad: Math.max(1, cfg.cantidad - 1) })}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-l text-gray-600 hover:bg-gray-100 cursor-pointer">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-7 h-6 flex items-center justify-center border-y border-gray-300 text-xs font-bold text-gray-800">{cfg.cantidad}</span>
                          <button type="button" onClick={() => updateConfig(prod.id, { ...cfg, cantidad: Math.min(prod.cantidad, cfg.cantidad + 1) })}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-r text-gray-600 hover:bg-gray-100 cursor-pointer">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400">Max {prod.cantidad}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-sm font-bold text-gray-800 mb-0.5">3. Calculo</p>
            <p className="text-xs text-gray-400 mb-2">Venta final</p>
            <div className="flex-1 overflow-y-auto min-h-0">
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
                    {productosDevueltos.map((prod) => {
                      const cfg = seleccionados[prod.id];
                      return (
                        <React.Fragment key={prod.id}>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 text-gray-700 font-medium">{prod.nombre}</td>
                            <td className="py-1 text-center text-gray-600">{cfg.cantidad}</td>
                            <td className="py-1 text-center text-gray-600">{formatCOP(prod.precioUnit)}</td>
                            <td className="py-1 text-right text-gray-700 font-semibold">{formatCOP(cfg.cantidad * prod.precioUnit)}</td>
                          </tr>
                          {cfg.motivo && (
                            <tr className="bg-gray-50">
                              <td className="py-1 pl-1 text-gray-500">{cfg.motivo}</td>
                              <td className="py-1 text-center text-gray-500">{cfg.metodo || '—'}</td>
                              <td colSpan={2} className="py-1 text-right">
                                <span className={`text-[10px] font-bold ${cfg.estado === 'Pendiente' ? 'text-yellow-600' : cfg.estado === 'Aprobada' ? 'text-green-600' : 'text-gray-400'}`}>{cfg.estado}</span>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex-shrink-0">
              <div className="grid grid-cols-3 text-[10px] text-gray-500 font-semibold mb-1">
                <span>Numero de<br/>Productos</span>
                <span className="text-center">Cantidad de<br/>Unidades</span>
                <span className="text-right">Total</span>
              </div>
              <div className="grid grid-cols-3 text-xs font-bold text-gray-800">
                <span>{productosDevueltos.length}</span>
                <span className="text-center">{totalUnidades}</span>
                <span className="text-right">{formatCOP(totalValor)}</span>
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

      <Evidence isOpen={evidenceOpen} onClose={() => setEvidenceOpen(false)}
        files={evidencias} descripcion={descripcion}
        onSave={({ files, descripcion: desc }) => {
          setEvidencias(files);
          setDescripcion(desc);
          if (touched.evidencias) {
            const err = validateField('evidencias', files);
            setErrors((p) => ({ ...p, evidencias: err }));
          }
        }} />
    </div>
  );
}

export default FormReturn;
