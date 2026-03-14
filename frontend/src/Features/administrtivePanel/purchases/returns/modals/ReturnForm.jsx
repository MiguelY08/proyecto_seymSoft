import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import {
  MOTIVOS_DEVOLUCION,
  TIPOS_DEVOLUCION,
  getEstadosByTipo,
  getEstadoInicial,
  formatCurrency,
  getBadgeEstadoProducto,
} from '../helpers/returnsHelpers';
import {
  validateReturnForm,
  productoTieneError,
} from '../validators/returnsValidators';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ReturnsDB from '../services/returnsServices';

// ─── Long press hook ──────────────────────────────────────────────────────────
function useLongPress(callback, { delay = 380, interval = 75 } = {}) {
  const timerRef    = useRef(null);
  const intervalRef = useRef(null);
  const cbRef       = useRef(callback);
  useEffect(() => { cbRef.current = callback; }, [callback]);

  const start = useCallback(() => {
    cbRef.current();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => cbRef.current(), interval);
    }, delay);
  }, [delay, interval]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
  }, []);

  return { onMouseDown: start, onMouseUp: stop, onMouseLeave: stop,
           onTouchStart: start, onTouchEnd: stop };
}

// ─── Dropdown de Estado con badges (portal fixed) ─────────────────────────────
function EstadoDropdown({ value, disabled, estados, onChange, hasError }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState(null);
  const btnRef          = useRef(null);
  const dropdownRef     = useRef(null);

  const toggle = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const r          = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const listH      = Math.min(estados.length * 38 + 8, 200);
      const openUp     = spaceBelow < listH && r.top > spaceBelow;
      setPos({
        left:   r.left,
        width:  r.width,
        top:    openUp ? undefined : r.bottom + 2,
        bottom: openUp ? window.innerHeight - r.top + 2 : undefined,
      });
    }
    setOpen((o) => !o);
  };

  // Cierre al hacer click fuera — excluye tanto el botón disparador como el portal
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const insideBtn      = btnRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);
      if (!insideBtn && !insideDropdown) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedStyle = value ? getBadgeEstadoProducto(value) : null;

  const borderClass = disabled
    ? 'border-gray-200 opacity-50 cursor-not-allowed'
    : hasError
    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
    : 'border-gray-300 hover:border-[#004D77] cursor-pointer';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs border rounded-lg
                    bg-white outline-none transition-colors duration-200 ${borderClass}`}
      >
        {value
          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={selectedStyle}>{value}</span>
          : <span className="text-gray-400">Seleccionar...</span>
        }
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-9999 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden py-1"
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Seleccionar...
          </button>
          {estados.map((estado) => {
            const style    = getBadgeEstadoProducto(estado);
            const isActive = value === estado;
            return (
              <button
                key={estado}
                type="button"
                onClick={() => { onChange(estado); setOpen(false); }}
                className={`w-full px-3 py-1.5 flex items-center gap-2 transition-colors
                  ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={style}>
                  {estado}
                </span>
                {isActive && (
                  <CheckCircle2 className="w-3 h-3 ml-auto text-[#004D77] shrink-0" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Clases base de inputs ────────────────────────────────────────────────────
const inputBase = 'w-full px-3 py-2 text-xs border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200';
const selectClass = (hasError) =>
  `appearance-none ${inputBase} cursor-pointer ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
      : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
  }`;

// ─── Sub-componente: configuración de producto (panel derecho) ────────────────
const ProductConfig = ({ producto, onChange, errores }) => {
  const estadosDisponibles = producto.tipoDevolucion
    ? getEstadosByTipo(producto.tipoDevolucion)
    : [];

  const badgeStyle = getBadgeEstadoProducto(producto.estado);

  const handleTipoChange = (nuevoTipo) => {
    onChange(producto.codigoBarras, { tipoDevolucion: nuevoTipo, estado: getEstadoInicial() });
  };

  // Cantidad: long press
  const decCb = useCallback(() => {
    onChange(producto.codigoBarras, {
      cantidadDevolver: Math.max(1, (producto.cantidadDevolver ?? 1) - 1),
    });
  }, [producto.codigoBarras, producto.cantidadDevolver, onChange]);

  const incCb = useCallback(() => {
    onChange(producto.codigoBarras, {
      cantidadDevolver: Math.min(producto.cantidadComprada, (producto.cantidadDevolver ?? 1) + 1),
    });
  }, [producto.codigoBarras, producto.cantidadDevolver, producto.cantidadComprada, onChange]);

  const lpDec = useLongPress(decCb);
  const lpInc = useLongPress(incCb);

  const fieldError = (campo) => errores?.[campo];

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">

      {/* Nombre + badge estado */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wide truncate pr-2">
          {producto.nombre}
        </h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={badgeStyle}>
          {producto.estado || '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">

        {/* Motivo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Motivo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={producto.motivo ?? ''}
              onChange={(e) => onChange(producto.codigoBarras, { motivo: e.target.value })}
              className={selectClass(!!fieldError('motivo'))}
            >
              <option value="">Seleccionar...</option>
              {MOTIVOS_DEVOLUCION.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
          </div>
          {fieldError('motivo') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('motivo')}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Tipo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={producto.tipoDevolucion ?? ''}
              onChange={(e) => handleTipoChange(e.target.value)}
              className={selectClass(!!fieldError('tipoDevolucion'))}
            >
              <option value="">Seleccionar...</option>
              {TIPOS_DEVOLUCION.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
          </div>
          {fieldError('tipoDevolucion') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('tipoDevolucion')}
            </p>
          )}
        </div>

        {/* Estado — dropdown custom con badges */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Estado <span className="text-red-500">*</span>
          </label>
          <EstadoDropdown
            value={producto.estado ?? ''}
            disabled={!producto.tipoDevolucion}
            estados={estadosDisponibles}
            onChange={(val) => onChange(producto.codigoBarras, { estado: val })}
            hasError={!!fieldError('estado')}
          />
          {fieldError('estado') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('estado')}
            </p>
          )}
        </div>

        {/* Cantidad — control compacto con long press */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                {...lpDec}
                disabled={(producto.cantidadDevolver ?? 1) <= 1}
                className="w-6 h-6 flex items-center justify-center text-gray-500
                           hover:bg-gray-100 transition-colors cursor-pointer select-none
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-2.5 h-2.5" strokeWidth={2.5} />
              </button>
              <input
                type="number"
                value={producto.cantidadDevolver ?? 1}
                min={1}
                max={producto.cantidadComprada}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val))
                    onChange(producto.codigoBarras, {
                      cantidadDevolver: Math.min(Math.max(1, val), producto.cantidadComprada),
                    });
                }}
                className="w-10 text-center text-xs font-semibold text-gray-700
                           border-x border-gray-200 outline-none py-0.5
                           [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                           [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                {...lpInc}
                disabled={(producto.cantidadDevolver ?? 1) >= producto.cantidadComprada}
                className="w-6 h-6 flex items-center justify-center text-gray-500
                           hover:bg-gray-100 transition-colors cursor-pointer select-none
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-2.5 h-2.5" strokeWidth={2.5} />
              </button>
            </div>
            <span className="text-[9px] text-gray-400 leading-tight">Máx: {producto.cantidadComprada}</span>
          </div>
          {fieldError('cantidadDevolver') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('cantidadDevolver')}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const ReturnForm = ({ mode = 'create', purchase, devolucion, onClose, onSaved }) => {
  const { showConfirm, showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();
  const isEdit   = mode === 'edit';

  // ── Productos de la compra (fuente de verdad, nunca cambia) ───────────────
  const productosCompra = useMemo(() =>
    (purchase?.productos ?? []).map((p) => ({
      nombre:           p.nombre       ?? p.producto ?? 'Producto',
      codigoBarras:     p.codigoBarras,
      valorUnit:        p.valorUnit,
      iva:              p.iva          ?? 0,
      cantidadComprada: p.cantidad     ?? p.cantidadProductos ?? 1,
    })),
    [purchase]
  );

  // ── Total original (siempre desde la compra, nunca cambia) ───────────────
  const totalOriginal = (p) =>
    Math.round(p.valorUnit * p.cantidadComprada * (1 + p.iva / 100));

  // ── Inicialización en modo edición ────────────────────────────────────────
  const initState = useMemo(() => {
    if (!isEdit || !devolucion?.productos?.length)
      return { seleccionados: new Set(), datosProducto: {} };

    const seleccionados = new Set(devolucion.productos.map((p) => p.codigoBarras));
    const datosProducto = {};
    devolucion.productos.forEach((p) => {
      const original = productosCompra.find((o) => o.codigoBarras === p.codigoBarras);
      datosProducto[p.codigoBarras] = {
        ...original, ...p,
        cantidadComprada: original?.cantidadComprada ?? p.cantidadComprada ?? 1,
      };
    });
    return { seleccionados, datosProducto };
  }, [isEdit, devolucion, productosCompra]);

  // ── Estado ────────────────────────────────────────────────────────────────
  const [seleccionados,   setSeleccionados]   = useState(initState.seleccionados);
  const [datosProducto,   setDatosProducto]   = useState(initState.datosProducto);
  const [erroresProducto, setErroresProducto] = useState({});
  const [erroresGenerales, setErroresGenerales] = useState([]);
  const [touched,         setTouched]         = useState(false);

  // ── Navegación al cerrar según modo ──────────────────────────────────────
  const cerrarYNavegar = useCallback(() => {
    if (!isEdit) navigate('/admin/purchases');
    else onClose();
  }, [isEdit, navigate, onClose]);

  // ── Cerrar con confirmación si hay datos ──────────────────────────────────
  const handleCerrar = async () => {
    if (seleccionados.size === 0) { cerrarYNavegar(); return; }
    const result = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      isEdit
        ? 'Tienes cambios sin guardar. Si sales ahora perderás todo lo que has modificado.'
        : 'Tienes información ingresada. Si sales ahora perderás todo lo que has ingresado.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Seguir editando' }
    );
    if (result?.isConfirmed) cerrarYNavegar();
  };

  // ── Selección / deselección ───────────────────────────────────────────────
  const toggleSeleccion = (codigoBarras) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(codigoBarras)) {
        next.delete(codigoBarras);
        setDatosProducto((d) => { const n = { ...d }; delete n[codigoBarras]; return n; });
        setErroresProducto((e) => { const n = { ...e }; delete n[codigoBarras]; return n; });
      } else {
        next.add(codigoBarras);
        const prod = productosCompra.find((p) => p.codigoBarras === codigoBarras);
        setDatosProducto((d) => ({
          ...d,
          [codigoBarras]: { ...prod, cantidadDevolver: 1, motivo: '', tipoDevolucion: '', estado: getEstadoInicial() },
        }));
      }
      return next;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === productosCompra.length) {
      setSeleccionados(new Set());
      setDatosProducto({});
      setErroresProducto({});
    } else {
      const todos = new Set(productosCompra.map((p) => p.codigoBarras));
      const datos = {};
      productosCompra.forEach((p) => {
        datos[p.codigoBarras] = datosProducto[p.codigoBarras] ?? {
          ...p, cantidadDevolver: 1, motivo: '', tipoDevolucion: '', estado: getEstadoInicial(),
        };
      });
      setSeleccionados(todos);
      setDatosProducto(datos);
    }
  };

  // ── Actualizar campo de un producto ───────────────────────────────────────
  const handleProductoChange = useCallback((codigoBarras, cambios) => {
    setDatosProducto((prev) => ({
      ...prev,
      [codigoBarras]: { ...prev[codigoBarras], ...cambios },
    }));
    if (touched) {
      setErroresProducto((prev) => {
        if (!prev[codigoBarras]) return prev;
        const updated = { ...prev[codigoBarras] };
        Object.keys(cambios).forEach((k) => delete updated[k]);
        return { ...prev, [codigoBarras]: updated };
      });
    }
  }, [touched]);

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setTouched(true);
    const productosADevolver = [...seleccionados].map((cod) => datosProducto[cod]);
    const { valid, erroresGenerales: eg, erroresProducto: ep } = validateReturnForm(productosADevolver);
    setErroresGenerales(eg);
    setErroresProducto(ep);

    if (!valid) {
      showWarning('Formulario incompleto', 'Por favor revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    const result = await showConfirm(
      'info',
      isEdit ? 'Confirmar edición' : 'Confirmar devolución',
      isEdit
        ? `¿Deseas guardar los cambios en la devolución ${devolucion.id}?`
        : `¿Deseas registrar esta devolución para la compra ${purchase?.numeroFacturacion}?`,
      { confirmButtonText: 'Sí, guardar', cancelButtonText: 'Cancelar' }
    );
    if (!result?.isConfirmed) return;

    try {
      if (isEdit) {
        ReturnsDB.update(devolucion.id, productosADevolver);
        showSuccess('Devolución actualizada', `Los cambios en ${devolucion.id} se guardaron correctamente.`);
      } else {
        const nueva = ReturnsDB.create(purchase.numeroFacturacion, productosADevolver);
        showSuccess('Devolución registrada', `Se creó la devolución ${nueva.id} correctamente.`);
      }
      onSaved?.();
      cerrarYNavegar();
    } catch {
      showError('Error', `No se pudo ${isEdit ? 'actualizar' : 'registrar'} la devolución.`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const productosSeleccionadosArray = [...seleccionados].map((cod) => datosProducto[cod]);

  return (
    <div
      onClick={handleCerrar}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '900px', maxWidth: '96vw', maxHeight: '92vh' }}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">
              {isEdit
                ? `Editando devolución ${devolucion?.id}`
                : `Nueva devolución — ${purchase?.numeroFacturacion ?? ''}`}
            </h2>
            {isEdit && (
              <span className="text-white/60 text-xs">Compra: {devolucion?.idCompra}</span>
            )}
          </div>
          <button
            onClick={handleCerrar}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">

          {/* Panel izquierdo — lista de productos de la compra */}
          <div className="w-[40%] shrink-0 flex flex-col overflow-hidden">
            <div className="px-5 pt-4 pb-2 shrink-0">
              <p className="text-sm font-medium text-gray-700 mb-0.5">1. Productos a devolver</p>
              <p className="text-xs text-gray-400 mb-2">
                {isEdit ? 'Modifica los productos de esta devolución' : 'Escoja los productos que desea devolver'}
              </p>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mb-2 select-none">
                <input
                  type="checkbox"
                  checked={productosCompra.length > 0 && seleccionados.size === productosCompra.length}
                  onChange={toggleTodos}
                  className="accent-[#004D77] w-3.5 h-3.5"
                />
                Seleccionar todos
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-1.5">
              {productosCompra.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-8">
                  Esta compra no tiene productos registrados.
                </p>
              )}

              {productosCompra.map((p) => {
                const isSelected = seleccionados.has(p.codigoBarras);
                const tieneError = productoTieneError(p.codigoBarras, erroresProducto);

                // Total siempre desde la compra original — nunca cambia
                const total = totalOriginal(p);

                return (
                  <div
                    key={p.codigoBarras}
                    onClick={() => toggleSeleccion(p.codigoBarras)}
                    className={`border rounded-lg p-2.5 cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? tieneError
                          ? 'border-red-400 bg-red-50'
                          : 'border-[#004D77] bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-[#004D77] w-3.5 h-3.5 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-xs font-semibold text-gray-800 truncate">{p.nombre}</p>
                          {isSelected && tieneError && (
                            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                          )}
                          {isSelected && !tieneError && touched && (
                            <CheckCircle2 className="w-3 h-3 text-[#004D77] shrink-0" strokeWidth={2} />
                          )}
                        </div>
                        {/* Datos de la compra — siempre estáticos */}
                        <div className="grid grid-cols-4 gap-x-1.5 text-[10px] text-gray-500">
                          <span className="font-medium text-gray-500">Cant.</span>
                          <span className="font-medium text-gray-500">Precio</span>
                          <span className="font-medium text-gray-500">%IVA</span>
                          <span className="font-medium text-gray-500 text-right">Total</span>
                          <span className="text-gray-700">{p.cantidadComprada}</span>
                          <span className="text-gray-700">{formatCurrency(p.valorUnit)}</span>
                          <span className="text-gray-700">{p.iva}%</span>
                          <span className="text-right font-semibold text-gray-800">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <p className="text-[10px] text-gray-400 mt-0.5">
                (Productos de la compra {purchase?.numeroFacturacion ?? devolucion?.idCompra})
              </p>
            </div>
          </div>

          {/* Panel derecho — configuración por producto */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 pt-4 pb-2 shrink-0">
              <p className="text-sm font-medium text-gray-700 mb-0.5">2. Configurar productos seleccionados</p>
              <p className="text-xs text-gray-400">
                Gestiona la cantidad, el estado y el motivo de cada producto
              </p>
            </div>

            {erroresGenerales.length > 0 && (
              <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                {erroresGenerales.map((e, i) => (
                  <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {e}
                  </p>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
              {productosSeleccionadosArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
                  <p className="text-sm">Ningún producto seleccionado</p>
                  <p className="text-xs">Selecciona productos del panel izquierdo para configurar su devolución</p>
                </div>
              ) : (
                productosSeleccionadosArray.map((p) => (
                  <ProductConfig
                    key={p.codigoBarras}
                    producto={p}
                    onChange={handleProductoChange}
                    errores={erroresProducto[p.codigoBarras]}
                  />
                ))
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleCerrar}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
          >
            {isEdit ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReturnForm;