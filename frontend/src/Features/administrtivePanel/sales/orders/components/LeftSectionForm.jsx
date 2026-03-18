import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FileText, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ESTADO_STYLES, EstadoBadgePill } from '../helpers/ordersHelpers';

// ─── Dropdown custom de Estado (portal fixed) ─────────────────────────────────
/**
 * EstadoDropdown — Dropdown personalizado para seleccionar estado de orden.
 * Usa portal para renderizar fuera del contenedor y evitar overflow.
 * Incluye confirmación al seleccionar "Cancelado".
 *
 * @param {Object} props
 * @param {string} props.value - Estado seleccionado.
 * @param {Array<string>} props.options - Opciones disponibles.
 * @param {Function} props.onChange - Callback para cambio (name, value).
 * @param {boolean} props.hasError - Si hay error de validación.
 */
const EstadoDropdown = ({ value, options, onChange, hasError }) => {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState(null);
  const btnRef          = useRef(null);
  const dropdownRef     = useRef(null);

  // ── Toggle dropdown y calcular posición ─────────────────────────────────────
  const toggle = () => {
    if (!open && btnRef.current) {
      const r          = btnRef.current.getBoundingClientRect();
      const listH      = options.length * 44 + 8;
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

  // ── Cerrar al click fuera ──────────────────────────────────────────────────
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

  const borderClass = hasError
    ? 'border-red-500'
    : open
    ? 'border-[#004D77] ring-2 ring-[#004D77]/20'
    : 'border-gray-300 hover:border-[#004D77]';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg
                    bg-white outline-none transition-colors duration-200 cursor-pointer ${borderClass}`}
      >
        {value
          ? <EstadoBadgePill estado={value} />
          : <span className="text-gray-400 text-sm">Seleccione un estado</span>
        }
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-9999 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden py-1"
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
        >
          {options.map((estado) => {
            const s        = ESTADO_STYLES[estado];
            const isActive = value === estado;
            return (
              <button
                key={estado}
                type="button"
                onClick={() => { onChange('estado', estado); setOpen(false); }}
                className={`w-full px-3 py-2.5 flex items-center justify-between gap-2
                            text-sm transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2">
                  {s && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                  )}
                  <span
                    className="font-semibold text-xs px-2 py-0.5 rounded-full"
                    style={s ? { backgroundColor: s.bg, color: s.color } : {}}
                  >
                    {estado}
                  </span>
                </div>
                {isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#004D77] shrink-0" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};

// ─── Campo de solo lectura ────────────────────────────────────────────────────
/**
 * ReadonlyField — Campo de solo lectura para datos no editables.
 * @param {Object} props
 * @param {string} props.value - Valor a mostrar.
 */
const ReadonlyField = ({ value }) => (
  <div className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
    {value || '—'}
  </div>
);

// ─── LeftSectionForm ──────────────────────────────────────────────────────────
/**
 * LeftSectionForm — Sección izquierda del formulario de edición de orden.
 * Contiene campos editables: dirección de entrega, estado y motivo de cancelación.
 * Incluye dropdown personalizado y validación visual.
 *
 * @param {Object} props
 * @param {Object} props.order - Datos de la orden.
 * @param {Function} props.onChange - Callback para cambios (name, value).
 * @param {Object} props.errors - Errores de validación por campo.
 */
const LeftSectionForm = ({ order, onChange, errors = {} }) => {
  if (!order) return null;

  // ── Handler para inputs estándar ────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const estadoOptions = ['Por aprobar', 'Aprobado', 'Cancelado'];

  return (
    <div className="bg-white rounded-lg border border-gray-200">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">2. Datos del pedido</p>
          <p className="text-xs text-gray-400">Información general del pedido</p>
        </div>
      </div>

      {/* Campos */}
      <div className="p-5 flex flex-col gap-4">

        {/* N° Pedido y Cliente — solo lectura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              N° Pedido <span className="text-red-500">*</span>
            </label>
            <ReadonlyField value={order.numerosPedido} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>
            <ReadonlyField value={order.cliente?.nombre || '—'} />
          </div>
        </div>

        {/* Fecha — solo lectura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha del pedido <span className="text-red-500">*</span>
          </label>
          <ReadonlyField value={order.fecha} />
        </div>

        {/* Dirección de entrega — editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Entrega <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="direccionEntrega"
            value={order.direccionEntrega || ''}
            onChange={handleInputChange}
            placeholder="Ingrese la dirección de entrega"
            className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors duration-200 ${
              errors.direccionEntrega
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
            }`}
          />
          {errors.direccionEntrega && (
            <p className="mt-1 text-xs text-red-500">{errors.direccionEntrega}</p>
          )}
        </div>

        {/* Estado del pedido — dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Estado de pedido <span className="text-red-500">*</span>
          </label>
          <EstadoDropdown
            value={order.estado}
            options={estadoOptions}
            onChange={onChange}
            hasError={!!errors.estado}
          />
          {errors.estado && (
            <p className="mt-1 text-xs text-red-500">{errors.estado}</p>
          )}
        </div>

        {/* Motivo de cancelación — condicional */}
        {order.estado === 'Cancelado' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              name="motivoCancelacion"
              rows={3}
              value={order.motivoCancelacion ?? ''}
              maxLength={300}
              placeholder="Describe el motivo de cancelación (mín. 10 caracteres)..."
              onChange={(e) => onChange('motivoCancelacion', e.target.value)}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg resize-none outline-none
                bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
                ${errors.motivoCancelacion
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.motivoCancelacion
                ? <p className="text-xs text-red-500">{errors.motivoCancelacion}</p>
                : <span />
              }
              <span className="text-xs text-gray-400 ml-auto">
                {(order.motivoCancelacion ?? '').length}/300
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LeftSectionForm;