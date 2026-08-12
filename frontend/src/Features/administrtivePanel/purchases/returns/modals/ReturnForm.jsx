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
  getEstadoTerminal,
  formatCurrency,
  getBadgeEstadoProducto,
  getAllowedNextReturnStatuses,
  isEstadoTerminal,
  isEstadoProveedorRechazado,
} from '../helpers/returnsHelpers';
import {
  validateReturnFormConLineas,
  validateReturnUpdateForm,
  productoTieneErrorConLineas,
} from '../validators/returnsValidators';
import { useAlert } from '../../../../shared/alerts/useAlert';
import {
  PurchaseReturnsService,
  mapReturnFormToCreatePayload,
  mapReturnFormToUpdatePayload,
} from '../services/returnsServices';
import FullScreenSpinner from '../../../../shared/spinner/FullScreenSpinner';

// ─── ID unico para lineas ─────────────────────────────────────────────────────
const newLineaId = () =>
  `linea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const isExistingReturnLine = (linea) =>
  linea?.idPurchaseReturnDetail !== undefined ||
  linea?.purchaseReturnDetailId !== undefined ||
  linea?.lineaId?.startsWith('existing-');

const hasExistingReturnLines = (producto) =>
  (producto?.lineas ?? []).some(isExistingReturnLine);
const toSafeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getReturnAvailableQuantity = (producto) =>
  Math.max(0, toSafeNumber(
    producto?.cantidadDisponibleDevolucion ??
    producto?.returnAvailability?.availableQuantity ??
    producto?.cantidadComprada,
    0
  ));

const getExistingReturnQuantity = (producto) =>
  (producto?.lineas ?? [])
    .filter(isExistingReturnLine)
    .reduce((sum, linea) => sum + (Number(linea?.cantidadDevolver) || 0), 0);

const getReturnQuantityLimit = (producto) =>
  getReturnAvailableQuantity(producto) + getExistingReturnQuantity(producto);

const getProductOverallStatus = (producto) => {
  const lineas = producto?.lineas ?? [];
  if (lineas.length === 0) return getEstadoInicial();

  const todasListas = lineas.every((linea) =>
    isEstadoTerminal(linea?.estado)
  );

  if (todasListas) return getEstadoTerminal();

  return (
    lineas.find((linea) => !isEstadoTerminal(linea?.estado))?.estado ||
    getEstadoInicial()
  );
};

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
function EstadoDropdown({ value, disabled, estados, onChange, hasError, allowEmpty = true }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState(null);
  const btnRef          = useRef(null);
  const dropdownRef     = useRef(null);

  const toggle = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const r          = btnRef.current.getBoundingClientRect();
      const listH      = Math.min(estados.length * 38 + 8, 200);
      const viewportW  = window.visualViewport?.width ?? window.innerWidth;
      const viewportH  = window.visualViewport?.height ?? window.innerHeight;
      const width      = Math.min(Math.max(r.width, 160), viewportW - 16);
      const left       = Math.min(Math.max(8, r.left), viewportW - width - 8);
      const spaceBelow = viewportH - r.bottom;
      const openUp     = spaceBelow < listH && r.top > spaceBelow;
      setPos({
        left,
        width,
        top:    openUp ? undefined : r.bottom + 2,
        bottom: openUp ? viewportH - r.top + 2 : undefined,
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
          className="fixed z-[9999] max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-2xl overscroll-contain"
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
        >
          {allowEmpty && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50 transition-colors"
            >
              Seleccionar...
            </button>
          )}
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
      <span className="text-[9px] text-gray-400 leading-tight">Max: {max}</span>
    </div>
  );
};

// ─── Campo de solo lectura ───────────────────────────────────────────────────
const ReadonlyField = ({ value, placeholder = '-' }) => (
  <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
    {value || placeholder}
  </div>
);

// ─── LineaConfig - una fila de devolucion por producto (con editable condicional) ──
const LineaConfig = ({ linea, maxCantidad, onChange, onRemove, canRemove, errores, editableCompleto, isEditMode }) => {
  const esTerminal     = isEstadoTerminal(linea.estado) || isEstadoProveedorRechazado(linea.estado);
  const esRechazoProveedor = isEstadoProveedorRechazado(linea.estado);
  const badgeStyle     = getBadgeEstadoProducto(linea.estado);
  const esExistente    = isExistingReturnLine(linea);
  const estadoBase     = linea.estadoOriginal || linea.estado;
  const estadosDisp    = !isEditMode
    ? (linea.tipoDevolucion ? getEstadosByTipo(linea.tipoDevolucion, linea.motivo) : [])
    : esExistente
      ? [
          estadoBase,
          ...getAllowedNextReturnStatuses(
            linea.idReturnMethod ?? linea.returnMethodId ?? linea.tipoDevolucion,
            linea.originalReturnStatusId ??
              linea.idReturnStatus ??
              linea.returnStatusId ??
              estadoBase,
            linea.idReturnReason ?? linea.returnReasonId ?? linea.motivo
          ).map((estado) => estado.label),
        ].filter((estado, index, estados) => estado && estados.indexOf(estado) === index)
      : [getEstadoInicial()];
  const fieldError     = (campo) => errores?.[campo];

  // Caso terminal: todo solo lectura (no editable)
  if (esTerminal) {
    return (
      <div className={`rounded-lg border p-2.5 ${esRechazoProveedor ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={badgeStyle}>
            {linea.estado}
          </span>
          <span className={`flex items-center gap-0.5 text-[9px] italic ${esRechazoProveedor ? 'text-orange-600' : 'text-emerald-600'}`}>
            <Lock className="w-2.5 h-2.5" strokeWidth={2} />
            {esRechazoProveedor ? 'Proveedor rechazó - inmutable' : 'Proceso completado - inmutable'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-3 sm:gap-x-3">
          <div>
            <span className="font-medium text-gray-500">Motivo</span>
            <p className="text-gray-700 mt-0.5">{linea.motivo || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Tipo</span>
            <p className="text-gray-700 mt-0.5">{linea.tipoDevolucion || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Cantidad</span>
            <p className="text-gray-700 font-semibold mt-0.5">{linea.cantidadDevolver}</p>
          </div>
        </div>
      </div>
    );
  }

  // Caso no terminal: segun editableCompleto se muestran inputs o solo lectura
  const mostrarInputs = editableCompleto;

  return (
    <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={badgeStyle}>
          {linea.estado || '-'}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Eliminar esta linea"
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
            allowEmpty={!isEditMode}
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

// ─── ProductConfig - panel de un producto con sus lineas (colapsable con animacion) ──
const ProductConfig = ({ producto, onAddLinea, onRemoveLinea, onLineaChange, errores, isExpanded, onToggleExpand, isEditMode }) => {
  const totalUsado       = (producto.lineas ?? []).reduce((sum, l) => sum + (Number(l.cantidadDevolver) || 0), 0);
  const cantidadLimite   = getReturnQuantityLimit(producto);
  const cantidadRestante = cantidadLimite - totalUsado;
  const puedeAgregar     = cantidadRestante > 0;

  const estadoPrincipal = getProductOverallStatus(producto);
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
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>Devolucion: {totalUsado}/{cantidadLimite} u.</span>
            <span>Disponible: {getReturnAvailableQuantity(producto)} u.</span>
            <span>Tipo: {producto.lineas?.[0]?.tipoDevolucion || '-'}</span>
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

      {/* Contenido expandible con animacion de altura usando grid */}
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
                const maxParaEstaLinea = Math.max(cantidadLimite - usadoOtras, 0);
                const erroresLinea     = errores?.lineas?.[idx] ?? {};
                const esNueva = !isExistingReturnLine(linea);
                const canRemove =
                  esNueva &&
                  !isEstadoTerminal(linea.estado) &&
                  !isEstadoProveedorRechazado(linea.estado);
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
                className="flex w-full min-w-0 items-center justify-center gap-1.5 px-2 py-1.5 text-center text-xs font-medium leading-tight whitespace-normal
                           text-[#004D77] border border-dashed border-[#004D77]/40 rounded-lg
                           hover:bg-[#004D77]/5 hover:border-[#004D77] transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                <span className="min-w-0">Agregar linea ({cantidadRestante} u. disponibles)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ReturnForm - componente principal ────────────────────────────────────────
const ReturnForm = ({ mode = 'create', purchase, devolucion, onClose, onSaved }) => {
  const { showConfirm, showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();
  const isEdit   = mode === 'edit';
  const purchaseId = purchase?.idPurchase ?? purchase?.purchaseId ?? purchase?.id;

  // Estado para controlar que card esta expandida (solo una a la vez)
  const [expandedProductId, setExpandedProductId] = useState(null);

  // ── Productos completos de la compra ────────────────────────────────────────
  const productosCompra = useMemo(() =>
    (purchase?.productos ?? []).map((p) => ({
      id:               p.id,
      idPurchase:       p.idPurchase ?? purchaseId,
      idPurchaseDetail: p.idPurchaseDetail ?? p.purchaseDetailId ?? p.id,
      purchaseDetailId: p.purchaseDetailId ?? p.idPurchaseDetail ?? p.id,
      idBarcode:        p.idBarcode ?? p.barcodeId,
      barcodeId:        p.barcodeId ?? p.idBarcode,
      idProduct:        p.idProduct ?? p.productId,
      productId:        p.productId ?? p.idProduct,
      nombre:           p.nombre       ?? p.producto ?? 'Producto',
      codigoBarras:     p.codigoBarras,
      valorUnit:        p.valorUnit,
      iva:              p.iva          ?? 0,
      cantidadComprada: p.cantidad     ?? p.cantidadProductos ?? 1,
      cantidadDisponibleDevolucion:
        p.cantidadDisponibleDevolucion ??
        p.returnAvailability?.availableQuantity ??
        p.cantidad ??
        p.cantidadProductos ??
        1,
      cantidadDevueltaDefinitiva:
        p.cantidadDevueltaDefinitiva ??
        p.returnAvailability?.finalReturnedQuantity ??
        0,
      cantidadReservadaDevolucion:
        p.cantidadReservadaDevolucion ??
        p.returnAvailability?.reservedQuantity ??
        0,
      returnAvailability: p.returnAvailability,
    })),
    [purchase, purchaseId]
  );

  // ── Inicialización de estados ──────────────────────────────────────────────
  const initState = useMemo(() => {
    if (isEdit && devolucion?.productos?.length) {
      const datosProducto = {};
      devolucion.productos.forEach((p, idx) => {
        const original = productosCompra.find((o) => o.codigoBarras === p.codigoBarras);
        if (!datosProducto[p.codigoBarras]) {
          datosProducto[p.codigoBarras] = {
            id:               original?.id ?? p.purchaseDetailId ?? p.idPurchaseDetail,
            idPurchase:       original?.idPurchase ?? purchaseId,
            idPurchaseDetail: p.idPurchaseDetail ?? p.purchaseDetailId ?? original?.idPurchaseDetail,
            purchaseDetailId: p.purchaseDetailId ?? p.idPurchaseDetail ?? original?.purchaseDetailId,
            idBarcode:        p.idBarcode ?? p.barcodeId ?? original?.idBarcode,
            barcodeId:        p.barcodeId ?? p.idBarcode ?? original?.barcodeId,
            idProduct:        p.idProduct ?? p.productId ?? original?.idProduct,
            productId:        p.productId ?? p.idProduct ?? original?.productId,
            nombre:           p.nombre,
            codigoBarras:     p.codigoBarras,
            valorUnit:        p.valorUnit,
            iva:              p.iva ?? 0,
            cantidadComprada: original?.cantidadComprada ?? p.cantidadComprada ?? 1,
            cantidadDisponibleDevolucion:
              original?.cantidadDisponibleDevolucion ??
              p.cantidadDisponibleDevolucion ??
              original?.cantidadComprada ??
              p.cantidadComprada ??
              1,
            cantidadDevueltaDefinitiva:
              original?.cantidadDevueltaDefinitiva ??
              p.cantidadDevueltaDefinitiva ??
              0,
            cantidadReservadaDevolucion:
              original?.cantidadReservadaDevolucion ??
              p.cantidadReservadaDevolucion ??
              0,
            returnAvailability: original?.returnAvailability ?? p.returnAvailability,
            lineas:           [],
          };
        }
        const idPurchaseReturnDetail = p.idPurchaseReturnDetail ?? p.id;
        const purchaseDetailId = p.purchaseDetailId ?? p.idPurchaseDetail ?? original?.purchaseDetailId;
        const returnReasonId = p.returnReasonId ?? p.idReturnReason;
        const returnMethodId = p.returnMethodId ?? p.idReturnMethod;
        const returnStatusId = p.returnStatusId ?? p.idReturnStatus;
        const estado = p.estado ?? getEstadoInicial();

        datosProducto[p.codigoBarras].lineas.push({
          lineaId:                 `existing-${idPurchaseReturnDetail ?? `${p.codigoBarras}-${idx}`}`,
          idPurchaseReturnDetail,
          purchaseReturnDetailId:  idPurchaseReturnDetail,
          idPurchaseDetail:        purchaseDetailId,
          purchaseDetailId,
          idReturnReason:          returnReasonId,
          returnReasonId,
          idReturnMethod:          returnMethodId,
          returnMethodId,
          idReturnStatus:          returnStatusId,
          returnStatusId,
          originalReturnStatusId:  returnStatusId,
          estadoOriginal:          estado,
          supplierDate:            p.supplierDate ?? null,
          motivo:                  p.motivo          ?? '',
          tipoDevolucion:          p.tipoDevolucion  ?? '',
          estado,
          cantidadDevolver: p.cantidadDevolver ?? 1,
        });
      });
      return { datosProducto, seleccionados: new Set(Object.keys(datosProducto)) };
    }
    return { datosProducto: {}, seleccionados: new Set() };
  }, [isEdit, devolucion, productosCompra, purchaseId]);

  const [datosProducto, setDatosProducto] = useState(initState.datosProducto);
  const [seleccionados, setSeleccionados] = useState(initState.seleccionados);
  const [erroresProducto, setErroresProducto] = useState({});
  const [erroresGenerales, setErroresGenerales] = useState([]);
  const [touched, setTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // En modo edicion, los productos seleccionados son todos los que ya estan en datosProducto
  const productosSeleccionadosArray = useMemo(() => {
    const productos = isEdit
      ? Object.values(datosProducto)
      : [...seleccionados].map((cod) => datosProducto[cod]).filter(Boolean);

    if (!isEdit) return productos;

    return [...productos].sort((a, b) => {
      const estadoA = getProductOverallStatus(a);
      const estadoB = getProductOverallStatus(b);
      const esTerminalA = isEstadoTerminal(estadoA);
      const esTerminalB = isEstadoTerminal(estadoB);
      if (esTerminalA && !esTerminalB) return -1;
      if (!esTerminalA && esTerminalB) return 1;
      return 0;
    });
  }, [isEdit, datosProducto, seleccionados]);

  // ── Handlers de seleccion ───────────────────────────────────────────────────
  const totalOriginal = (p) => Math.round(p.valorUnit * p.cantidadComprada * (1 + p.iva / 100));

  const toggleSeleccion = (codigoBarras) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(codigoBarras)) {
        if (isEdit && hasExistingReturnLines(datosProducto[codigoBarras])) {
          return prev;
        }
        next.delete(codigoBarras);
        setDatosProducto((d) => { const n = { ...d }; delete n[codigoBarras]; return n; });
        setErroresProducto((e) => { const n = { ...e }; delete n[codigoBarras]; return n; });
      } else {
        const prod = productosCompra.find((p) => p.codigoBarras === codigoBarras);
        if (!prod || (!isEdit && getReturnAvailableQuantity(prod) <= 0)) {
          return prev;
        }
        next.add(codigoBarras);
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
    const nonLocked = isEdit
      ? productosCompra
      : productosCompra.filter((p) => getReturnAvailableQuantity(p) > 0);
    const allSelected = nonLocked.every((p) => seleccionados.has(p.codigoBarras));
    if (allSelected && nonLocked.length > 0) {
      if (isEdit) {
        const existingEntries = Object.entries(datosProducto)
          .filter(([, producto]) => hasExistingReturnLines(producto));
        const existingCodes = new Set(existingEntries.map(([codigoBarras]) => codigoBarras));

        setSeleccionados(existingCodes);
        setDatosProducto(Object.fromEntries(existingEntries));
        setErroresProducto((prev) =>
          Object.fromEntries(
            Object.entries(prev).filter(([codigoBarras]) => existingCodes.has(codigoBarras))
          )
        );
      } else {
        setSeleccionados(new Set());
        setDatosProducto({});
        setErroresProducto({});
      }
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

  // ── Handlers de lineas ─────────────────────────────────────────────────────
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
    if (isSaving) return;
    setTouched(true);
    const productosParaValidar = productosSeleccionadosArray;
    const {
      valid,
      hasChanges = true,
      erroresGenerales: eg,
      erroresProducto: ep,
    } = isEdit
      ? validateReturnUpdateForm(productosParaValidar)
      : validateReturnFormConLineas(productosParaValidar, purchase);

    setErroresGenerales(eg);
    setErroresProducto(ep);

    if (!valid) {
      showWarning(
        isEdit && !hasChanges ? 'Sin cambios' : 'Formulario incompleto',
        eg?.[0] || 'Por favor revisa los campos marcados en rojo antes de continuar.'
      );
      return;
    }

    const result = await showConfirm(
      'info',
      isEdit ? 'Confirmar edición' : 'Confirmar devolución',
      isEdit
        ? `¿Deseas guardar los cambios en la devolución ${devolucion.id}?`
        : `¿Deseas registrar esta devolución para la compra ${purchase?.numeroFacturacion}?`,
      { confirmButtonText: 'Si, guardar', cancelButtonText: 'Cancelar' }
    );
    if (!result?.isConfirmed) return;

    try {
      setIsSaving(true);
      let devolucionGuardada;

      if (isEdit) {
        const payload = mapReturnFormToUpdatePayload(productosSeleccionadosArray);
        devolucionGuardada = await PurchaseReturnsService.update(devolucion.id, payload);
        showSuccess('Devolucion actualizada', `Los cambios en ${devolucion.id} se guardaron correctamente.`);
      } else {
        const payload = mapReturnFormToCreatePayload(purchase, productosSeleccionadosArray);
        devolucionGuardada = await PurchaseReturnsService.create(payload);
        showSuccess('Devolucion registrada', `Se creo la devolucion ${devolucionGuardada.id} correctamente.`);
      }
      await onSaved?.(devolucionGuardada);
      cerrarYNavegar();
    } catch (error) {
      setIsSaving(false);
      showError('Error', error.message || `No se pudo ${isEdit ? 'actualizar' : 'registrar'} la devolución.`);
    }
  };

  const cerrarYNavegar = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    if (!isEdit) navigate('/admin/purchases');
  }, [isEdit, navigate, onClose]);

  const handleCerrar = async () => {
    if (isSaving) return;
    if (productosSeleccionadosArray.length === 0) { cerrarYNavegar(); return; }
    const result = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      isEdit
        ? 'Tienes cambios sin guardar. Si sales ahora perderás todo lo que has modificado.'
        : 'Tienes informacion ingresada. Si sales ahora perderas todo lo que has ingresado.',
      { confirmButtonText: 'Si, salir', cancelButtonText: 'Seguir editando' }
    );
    if (result?.isConfirmed) cerrarYNavegar();
  };

  const productosSeleccionables = isEdit
    ? productosCompra
    : productosCompra.filter((p) => getReturnAvailableQuantity(p) > 0);
  const todosSeleccionables = productosSeleccionables.length > 0 &&
    productosSeleccionables.every((p) => seleccionados.has(p.codigoBarras));

  return (
    <div
      onClick={handleCerrar}
      className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
    >
      {isSaving && (
        <FullScreenSpinner
          message={isEdit ? 'Guardando cambios...' : 'Registrando devolución...'}
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[92vh] sm:w-[min(920px,96vw)] sm:rounded-lg"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#004D77] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight text-white sm:text-lg">
              {isEdit
                ? `Editando devolución ${devolucion?.id}`
                : `Nueva devolución - ${purchase?.numeroFacturacion ?? ''}`}
            </h2>
            {isEdit && (
              <span className="text-white/60 text-xs">Compra: {devolucion?.idCompra}</span>
            )}
          </div>
          <button
            onClick={handleCerrar}
            className="shrink-0 rounded-full p-1 text-white transition-colors hover:bg-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex w-full shrink-0 flex-col border-b border-gray-200">
              <div className="shrink-0 px-4 pb-2 pt-3 sm:px-5 sm:pt-4">
                <p className="text-sm font-medium text-gray-700 mb-0.5">
                  {isEdit ? 'Productos de la compra' : 'Productos a devolver'}
                </p>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mb-2 select-none">
                  <input
                    type="checkbox"
                    checked={
                      todosSeleccionables
                    }
                    onChange={toggleTodos}
                    className="accent-[#004D77] w-3.5 h-3.5"
                    disabled={productosSeleccionables.length === 0}
                  />
                  Seleccionar todos
                </label>
              </div>
              <div className="flex max-h-[26dvh] flex-col gap-1.5 overflow-y-auto px-4 pb-3 sm:px-5 lg:max-h-[24dvh] lg:pb-4">
                {productosCompra.map((p) => {
                  const isSelected = seleccionados.has(p.codigoBarras);
                  const tieneError = productoTieneErrorConLineas(p.codigoBarras, erroresProducto);
                  const isPersisted = isEdit && hasExistingReturnLines(datosProducto[p.codigoBarras]);
                  const sinDisponible = !isEdit && getReturnAvailableQuantity(p) <= 0;
                  const total = totalOriginal(p);
                  return (
                    <div
                      key={p.codigoBarras}
                      onClick={() => { if (!sinDisponible) toggleSeleccion(p.codigoBarras); }}
                      className={`border rounded-lg p-2.5 transition-colors duration-150 ${
                        isPersisted || sinDisponible ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      } ${
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
                          disabled={isPersisted || sinDisponible}
                          className="accent-[#004D77] w-3.5 h-3.5 mt-0.5 shrink-0 disabled:opacity-60"
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
                          <div className="mt-1 text-[10px] text-gray-500">
                            Disponible para devolver: <span className="font-semibold text-gray-700">{getReturnAvailableQuantity(p)} u.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          <div className="flex shrink-0 flex-col overflow-visible">
            <div className="shrink-0 px-4 pb-2 pt-3 sm:px-5 sm:pt-4">
              <p className="text-sm font-medium text-gray-700 mb-0.5">Configurar productos</p>
            </div>

            {erroresGenerales.length > 0 && (
              <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 sm:mx-5">
                {erroresGenerales.map((e, i) => (
                  <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {e}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-none flex-col gap-3 overflow-visible px-4 pb-4 sm:px-5">
              {productosSeleccionadosArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
                  <p className="text-sm">Ningun producto seleccionado</p>
                  <p className="text-xs">Selecciona productos del panel izquierdo para configurar su devolucion</p>
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
        <div className="flex shrink-0 flex-col-reverse items-stretch gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
          <button
            onClick={handleCerrar}
            disabled={isSaving}
            className="w-full rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={isSaving}
            className="w-full rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
          >
            {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnForm;






