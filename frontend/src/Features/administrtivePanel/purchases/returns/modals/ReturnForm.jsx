import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X, Plus, Minus, AlertCircle, CheckCircle2,
  ChevronDown, Trash2, Lock, ChevronUp,
} from 'lucide-react';
import {
  MOTIVOS_DEVOLUCION,
  TIPOS_DEVOLUCION,
  getEstadosByTipo,
  getEstadoInicial,
  formatCurrency,
  getBadgeEstadoProducto,
  isEstadoTerminal,
} from '../helpers/returnsHelpers';
import {
  validateReturnFormConLineas,
  productoTieneErrorConLineas,
} from '../validators/returnsValidators';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ReturnsDB from '../services/returnsServices';

// ─── ID único para líneas ─────────────────────────────────────────────────────
const newLineaId = () =>
  `linea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── useLongPress ─────────────────────────────────────────────────────────────
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

  return {
    onMouseDown: start, onMouseUp: stop, onMouseLeave: stop,
    onTouchStart: start, onTouchEnd: stop,
  };
}

// ─── EstadoDropdown (portal fixed) ────────────────────────────────────────────
function EstadoDropdown({ value, disabled, estados, onChange, hasError }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState(null);
  const btnRef          = useRef(null);
  const dropdownRef     = useRef(null);

  const toggle = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const r          = btnRef.current.getBoundingClientRect();
      const listH      = Math.min(estados.length * 38 + 8, 200);
      const spaceBelow = window.innerHeight - r.bottom;
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
  const borderClass   = disabled
    ? 'border-gray-200 opacity-50 cursor-not-allowed'
    : hasError
    ? 'border-red-500'
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
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden py-1"
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

// ─── Selector de motivo (editable) ───────────────────────────────────────────
const MotivoSelect = ({ value, onChange, hasError }) => (
  <div className="relative">
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none w-full px-3 py-2 text-xs border rounded-lg outline-none bg-white cursor-pointer ${inputBase} ${
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
          : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
      }`}
    >
      <option value="">Seleccionar...</option>
      {MOTIVOS_DEVOLUCION.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
  </div>
);

// ─── Selector de tipo (editable) ─────────────────────────────────────────────
const TipoSelect = ({ value, onChange, hasError }) => (
  <div className="relative">
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none w-full px-3 py-2 text-xs border rounded-lg outline-none bg-white cursor-pointer ${inputBase} ${
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
          : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
      }`}
    >
      <option value="">Seleccionar...</option>
      {TIPOS_DEVOLUCION.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
  </div>
);

// ─── Campo cantidad editable con botones (+/-) (mejorado) ─────────────────────
const CantidadInput = ({ value, max, onChange, hasError }) => {
  const cantidad = value ?? 1;
  const decCb = useCallback(() => onChange(Math.max(1, cantidad - 1)), [cantidad, onChange]);
  const incCb = useCallback(() => onChange(Math.min(max, cantidad + 1)), [cantidad, max, onChange]);
  const lpDec = useLongPress(decCb);
  const lpInc = useLongPress(incCb);

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-fit">
        <button
          type="button" {...lpDec}
          disabled={cantidad <= 1}
          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100
                     transition-colors cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-2.5 h-2.5" strokeWidth={2.5} />
        </button>
        <input
          type="number"
          value={cantidad}
          min={1}
          max={max}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) onChange(Math.min(Math.max(1, val), max));
          }}
          className={`w-12 text-center text-xs font-semibold text-gray-700 border-x border-gray-200
                     outline-none py-0.5 [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none ${hasError ? 'text-red-600' : ''}`}
        />
        <button
          type="button" {...lpInc}
          disabled={cantidad >= max}
          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100
                     transition-colors cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-2.5 h-2.5" strokeWidth={2.5} />
        </button>
      </div>
      <span className="text-[9px] text-gray-400 leading-tight">Máx: {max}</span>
    </div>
  );
};

// ─── Campo de solo lectura ───────────────────────────────────────────────────
const ReadonlyField = ({ value, placeholder = '—' }) => (
  <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
    {value || placeholder}
  </div>
);

// ─── LineaConfig — una fila de devolución por producto (con editable condicional) ──
const LineaConfig = ({ linea, maxCantidad, onChange, onRemove, canRemove, errores, editableCompleto, isEditMode }) => {
  const esTerminal     = isEstadoTerminal(linea.estado);
  const badgeStyle     = getBadgeEstadoProducto(linea.estado);
  const estadosDisp    = linea.tipoDevolucion ? getEstadosByTipo(linea.tipoDevolucion) : [];
  const fieldError     = (campo) => errores?.[campo];

  // Caso terminal: todo solo lectura (no editable)
  if (esTerminal) {
    return (
      <div className="border border-green-200 rounded-lg p-2.5 bg-green-50">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={badgeStyle}>
            {linea.estado}
          </span>
          <span className="text-[9px] text-emerald-600 flex items-center gap-0.5 italic">
            <Lock className="w-2.5 h-2.5" strokeWidth={2} />
            Proceso completado — inmutable
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-3 text-[10px]">
          <div>
            <span className="font-medium text-gray-500">Motivo</span>
            <p className="text-gray-700 mt-0.5">{linea.motivo || '—'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Tipo</span>
            <p className="text-gray-700 mt-0.5">{linea.tipoDevolucion || '—'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Cantidad</span>
            <p className="text-gray-700 font-semibold mt-0.5">{linea.cantidadDevolver}</p>
          </div>
        </div>
      </div>
    );
  }

  // Caso no terminal: según editableCompleto se muestran inputs o solo lectura
  const mostrarInputs = editableCompleto;

  return (
    <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={badgeStyle}>
          {linea.estado || '—'}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Eliminar esta línea"
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Motivo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Motivo <span className="text-red-500">*</span></label>
          {mostrarInputs ? (
            <MotivoSelect
              value={linea.motivo}
              onChange={(val) => onChange({ motivo: val })}
              hasError={!!fieldError('motivo')}
            />
          ) : (
            <ReadonlyField value={linea.motivo} placeholder="Seleccionar..." />
          )}
          {fieldError('motivo') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('motivo')}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Tipo <span className="text-red-500">*</span></label>
          {mostrarInputs ? (
            <TipoSelect
              value={linea.tipoDevolucion}
              onChange={(val) => {
                onChange({ tipoDevolucion: val, estado: getEstadoInicial() });
              }}
              hasError={!!fieldError('tipoDevolucion')}
            />
          ) : (
            <ReadonlyField value={linea.tipoDevolucion} placeholder="Seleccionar..." />
          )}
          {fieldError('tipoDevolucion') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('tipoDevolucion')}
            </p>
          )}
        </div>

        {/* Estado (siempre editable en no terminal, pero se deshabilita si no hay tipo) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Estado <span className="text-red-500">*</span></label>
          <EstadoDropdown
            value={linea.estado ?? ''}
            disabled={!linea.tipoDevolucion}
            estados={estadosDisp}
            onChange={(val) => onChange({ estado: val })}
            hasError={!!fieldError('estado')}
          />
          {fieldError('estado') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {fieldError('estado')}
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Cantidad <span className="text-red-500">*</span></label>
          {mostrarInputs ? (
            <CantidadInput
              value={linea.cantidadDevolver}
              max={maxCantidad}
              onChange={(val) => onChange({ cantidadDevolver: val })}
              hasError={!!fieldError('cantidadDevolver')}
            />
          ) : (
            <ReadonlyField value={linea.cantidadDevolver} placeholder="1" />
          )}
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

// ─── ProductConfig — panel de un producto con sus líneas (colapsable con animación) ──
const ProductConfig = ({ producto, onAddLinea, onRemoveLinea, onLineaChange, errores, isExpanded, onToggleExpand, isEditMode }) => {
  const totalUsado       = (producto.lineas ?? []).reduce((sum, l) => sum + (Number(l.cantidadDevolver) || 0), 0);
  const cantidadRestante = producto.cantidadComprada - totalUsado;
  const puedeAgregar     = cantidadRestante > 0;

  const estadoPrincipal = producto.lineas?.[0]?.estado || getEstadoInicial();
  const badgeStyle = getBadgeEstadoProducto(estadoPrincipal);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-800 truncate">{producto.nombre}</h4>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={badgeStyle}>
              {estadoPrincipal}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>Devolución: {totalUsado}/{producto.cantidadComprada} u.</span>
            <span>Tipo: {producto.lineas?.[0]?.tipoDevolucion || '—'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Contenido expandible con animación de altura usando grid */}
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <div className="flex flex-col gap-2 mb-2">
              {(producto.lineas ?? []).map((linea, idx) => {
                const usadoOtras = (producto.lineas ?? [])
                  .filter((_, i) => i !== idx)
                  .reduce((sum, l) => sum + (Number(l.cantidadDevolver) || 0), 0);
                const maxParaEstaLinea = producto.cantidadComprada - usadoOtras;
                const erroresLinea     = errores?.lineas?.[idx] ?? {};
                const canRemove        = !isEstadoTerminal(linea.estado) && (producto.lineas ?? []).length > 1;
                const esNueva = !linea.lineaId?.startsWith('existing-');
                const editableCompleto = !isEditMode || esNueva;

                return (
                  <LineaConfig
                    key={linea.lineaId}
                    linea={linea}
                    maxCantidad={maxParaEstaLinea}
                    onChange={(cambios) => onLineaChange(idx, cambios)}
                    onRemove={() => onRemoveLinea(idx)}
                    canRemove={canRemove}
                    errores={erroresLinea}
                    editableCompleto={editableCompleto}
                    isEditMode={isEditMode}
                  />
                );
              })}
            </div>

            {puedeAgregar && (
              <button
                type="button"
                onClick={onAddLinea}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium
                           text-[#004D77] border border-dashed border-[#004D77]/40 rounded-lg
                           hover:bg-[#004D77]/5 hover:border-[#004D77] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                Agregar línea ({cantidadRestante} u. disponibles)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ReturnForm — componente principal ────────────────────────────────────────
const ReturnForm = ({ mode = 'create', purchase, devolucion, onClose, onSaved }) => {
  const { showConfirm, showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();
  const isEdit   = mode === 'edit';

  // Estado para controlar qué card está expandida (solo una a la vez)
  const [expandedProductId, setExpandedProductId] = useState(null);

  // ── Productos de la compra (solo se usan en modo creación) ──────────────────
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

  // ── Inicialización de estados ──────────────────────────────────────────────
  const initState = useMemo(() => {
    if (isEdit && devolucion?.productos?.length) {
      const datosProducto = {};
      devolucion.productos.forEach((p, idx) => {
        const original = productosCompra.find((o) => o.codigoBarras === p.codigoBarras);
        if (!datosProducto[p.codigoBarras]) {
          datosProducto[p.codigoBarras] = {
            nombre:           p.nombre,
            codigoBarras:     p.codigoBarras,
            valorUnit:        p.valorUnit,
            iva:              p.iva ?? 0,
            cantidadComprada: original?.cantidadComprada ?? p.cantidadComprada ?? 1,
            lineas:           [],
          };
        }
        datosProducto[p.codigoBarras].lineas.push({
          lineaId:         `existing-${p.codigoBarras}-${idx}`,
          motivo:          p.motivo          ?? '',
          tipoDevolucion:  p.tipoDevolucion  ?? '',
          estado:          p.estado          ?? getEstadoInicial(),
          cantidadDevolver: p.cantidadDevolver ?? 1,
        });
      });
      return { datosProducto, seleccionados: new Set(Object.keys(datosProducto)) };
    }
    return { datosProducto: {}, seleccionados: new Set() };
  }, [isEdit, devolucion, productosCompra]);

  const [datosProducto, setDatosProducto] = useState(initState.datosProducto);
  const [seleccionados, setSeleccionados] = useState(initState.seleccionados);
  const [erroresProducto, setErroresProducto] = useState({});
  const [erroresGenerales, setErroresGenerales] = useState([]);
  const [touched, setTouched] = useState(false);

  // En modo edición, los productos seleccionados son todos los que ya están en datosProducto
  let productosSeleccionadosArray = useMemo(() => {
    if (isEdit) return Object.values(datosProducto);
    return [...seleccionados].map((cod) => datosProducto[cod]).filter(Boolean);
  }, [isEdit, datosProducto, seleccionados]);

  // Ordenar cards en modo edición: primero los que tienen estado "Enviado" o "Recibido"
  if (isEdit) {
    productosSeleccionadosArray = [...productosSeleccionadosArray].sort((a, b) => {
      const estadoA = a.lineas?.[0]?.estado || '';
      const estadoB = b.lineas?.[0]?.estado || '';
      const esTerminalA = estadoA === 'Enviado' || estadoA === 'Recibido';
      const esTerminalB = estadoB === 'Enviado' || estadoB === 'Recibido';
      if (esTerminalA && !esTerminalB) return -1;
      if (!esTerminalA && esTerminalB) return 1;
      return 0;
    });
  }

  // ── Handlers de selección (solo para modo creación) ─────────────────────────
  const totalOriginal = (p) => Math.round(p.valorUnit * p.cantidadComprada * (1 + p.iva / 100));

  const toggleSeleccion = (codigoBarras) => {
    if (isEdit) return;
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
          [codigoBarras]: {
            ...prod,
            lineas: [{ lineaId: newLineaId(), motivo: '', tipoDevolucion: '', estado: getEstadoInicial(), cantidadDevolver: 1 }],
          },
        }));
      }
      return next;
    });
  };

  const toggleTodos = () => {
    if (isEdit) return;
    const nonLocked = productosCompra.filter((p) => true);
    const allSelected = nonLocked.every((p) => seleccionados.has(p.codigoBarras));
    if (allSelected && nonLocked.length > 0) {
      setSeleccionados(new Set());
      setDatosProducto({});
      setErroresProducto({});
    } else {
      const newSel = new Set(seleccionados);
      const newDatos = { ...datosProducto };
      nonLocked.forEach((p) => {
        if (!newSel.has(p.codigoBarras)) {
          newSel.add(p.codigoBarras);
          newDatos[p.codigoBarras] = {
            ...p,
            lineas: [{ lineaId: newLineaId(), motivo: '', tipoDevolucion: '', estado: getEstadoInicial(), cantidadDevolver: 1 }],
          };
        }
      });
      setSeleccionados(newSel);
      setDatosProducto(newDatos);
    }
  };

  // ── Handlers de líneas ─────────────────────────────────────────────────────
  const handleAddLinea = useCallback((codigoBarras) => {
    setDatosProducto((prev) => {
      const prod = prev[codigoBarras];
      return {
        ...prev,
        [codigoBarras]: {
          ...prod,
          lineas: [
            ...prod.lineas,
            { lineaId: newLineaId(), motivo: '', tipoDevolucion: '', estado: getEstadoInicial(), cantidadDevolver: 1 },
          ],
        },
      };
    });
  }, []);

  const handleRemoveLinea = useCallback((codigoBarras, lineaIdx) => {
    setDatosProducto((prev) => {
      const prod = prev[codigoBarras];
      return {
        ...prev,
        [codigoBarras]: {
          ...prod,
          lineas: prod.lineas.filter((_, i) => i !== lineaIdx),
        },
      };
    });
    if (touched) {
      setErroresProducto((prev) => {
        const prodErr = prev[codigoBarras];
        if (!prodErr) return prev;
        const newLineas = (prodErr.lineas ?? []).filter((_, i) => i !== lineaIdx);
        return { ...prev, [codigoBarras]: { ...prodErr, lineas: newLineas } };
      });
    }
  }, [touched]);

  const handleLineaChange = useCallback((codigoBarras, lineaIdx, cambios) => {
    setDatosProducto((prev) => {
      const prod    = prev[codigoBarras];
      const newLineas = prod.lineas.map((l, i) => {
        if (i !== lineaIdx) return l;
        const updated = { ...l, ...cambios };
        if (cambios.tipoDevolucion && cambios.tipoDevolucion !== l.tipoDevolucion) {
          updated.estado = getEstadoInicial();
        }
        return updated;
      });
      return { ...prev, [codigoBarras]: { ...prod, lineas: newLineas } };
    });
    if (touched) {
      setErroresProducto((prev) => {
        const prodErr = prev[codigoBarras];
        if (!prodErr) return prev;
        const newLineas = (prodErr.lineas ?? []).map((le, i) => {
          if (i !== lineaIdx) return le;
          const updated = { ...le };
          Object.keys(cambios).forEach((k) => delete updated[k]);
          return updated;
        });
        return { ...prev, [codigoBarras]: { ...prodErr, lineas: newLineas } };
      });
    }
  }, [touched]);

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setTouched(true);
    const productosParaValidar = productosSeleccionadosArray;
    const { valid, erroresGenerales: eg, erroresProducto: ep } =
      validateReturnFormConLineas(productosParaValidar);

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

    const productosAGuardar = productosSeleccionadosArray.flatMap((prod) =>
      (prod.lineas ?? []).map((linea) => ({
        nombre:           prod.nombre,
        codigoBarras:     prod.codigoBarras,
        valorUnit:        prod.valorUnit,
        iva:              prod.iva,
        cantidadComprada: prod.cantidadComprada,
        cantidadDevolver: linea.cantidadDevolver,
        motivo:           linea.motivo,
        tipoDevolucion:   linea.tipoDevolucion,
        estado:           linea.estado,
      }))
    );

    try {
      if (isEdit) {
        ReturnsDB.update(devolucion.id, productosAGuardar);
        showSuccess('Devolución actualizada', `Los cambios en ${devolucion.id} se guardaron correctamente.`);
      } else {
        const nueva = ReturnsDB.create(purchase.numeroFacturacion, productosAGuardar);
        showSuccess('Devolución registrada', `Se creó la devolución ${nueva.id} correctamente.`);
      }
      onSaved?.();
      cerrarYNavegar();
    } catch {
      showError('Error', `No se pudo ${isEdit ? 'actualizar' : 'registrar'} la devolución.`);
    }
  };

  const cerrarYNavegar = useCallback(() => {
    if (!isEdit) navigate('/admin/purchases');
    else onClose();
  }, [isEdit, navigate, onClose]);

  const handleCerrar = async () => {
    if (productosSeleccionadosArray.length === 0) { cerrarYNavegar(); return; }
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

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      onClick={handleCerrar}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '920px', maxWidth: '96vw', maxHeight: '92vh' }}
      >
        {/* Header */}
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

        {/* Body: dos columnas solo en creación; una columna en edición */}
        <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">
          {!isEdit && (
            <div className="w-[40%] shrink-0 flex flex-col overflow-hidden">
              <div className="px-5 pt-4 pb-2 shrink-0">
                <p className="text-sm font-medium text-gray-700 mb-0.5">Productos a devolver</p>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mb-2 select-none">
                  <input
                    type="checkbox"
                    checked={productosCompra.length > 0 && seleccionados.size === productosCompra.length}
                    onChange={toggleTodos}
                    className="accent-[#004D77] w-3.5 h-3.5"
                    disabled={productosCompra.length === 0}
                  />
                  Seleccionar todos
                </label>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-1.5">
                {productosCompra.map((p) => {
                  const isSelected = seleccionados.has(p.codigoBarras);
                  const tieneError = productoTieneErrorConLineas(p.codigoBarras, erroresProducto);
                  const total = totalOriginal(p);
                  return (
                    <div
                      key={p.codigoBarras}
                      onClick={() => toggleSeleccion(p.codigoBarras)}
                      className={`border rounded-lg p-2.5 transition-colors duration-150 cursor-pointer ${
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
                            {isSelected && tieneError && <AlertCircle className="w-3 h-3 text-red-500" />}
                          </div>
                          <div className="grid grid-cols-4 gap-x-1.5 text-[10px] text-gray-500">
                            <span>Cant.</span><span>Precio</span><span>%IVA</span><span className="text-right">Total</span>
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
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 pt-4 pb-2 shrink-0">
              <p className="text-sm font-medium text-gray-700 mb-0.5">Configurar productos</p>
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

            <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
              {productosSeleccionadosArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
                  <p className="text-sm">Ningún producto seleccionado</p>
                  <p className="text-xs">Selecciona productos del panel izquierdo para configurar su devolución</p>
                </div>
              ) : (
                productosSeleccionadosArray.map((prod) => (
                  <ProductConfig
                    key={prod.codigoBarras}
                    producto={prod}
                    onAddLinea={() => handleAddLinea(prod.codigoBarras)}
                    onRemoveLinea={(idx) => handleRemoveLinea(prod.codigoBarras, idx)}
                    onLineaChange={(idx, cambios) => handleLineaChange(prod.codigoBarras, idx, cambios)}
                    errores={erroresProducto[prod.codigoBarras]}
                    isExpanded={expandedProductId === prod.codigoBarras}
                    onToggleExpand={() => setExpandedProductId(prev => prev === prod.codigoBarras ? null : prod.codigoBarras)}
                    isEditMode={isEdit}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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