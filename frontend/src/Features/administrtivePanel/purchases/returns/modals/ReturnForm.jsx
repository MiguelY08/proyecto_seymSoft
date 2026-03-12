import React, { useState, useCallback, useMemo } from 'react';
import { X, Plus, Minus, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import {
  MOTIVOS_DEVOLUCION,
  TIPOS_DEVOLUCION,
  getEstadosByTipo,
  getEstadoInicial,
  calcularTotalesProducto,
  formatCurrency,
  getBadgeEstadoProducto,
} from '../helpers/returnsHelpers';
import {
  validateReturnForm,
  productoTieneError,
} from '../validators/returnsValidators';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ReturnsDB from '../services/returnsServices';

// ─── Clases de input (estilo FormUser) ────────────────────────────────────────
const inputBase =
  'w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200';

const inputClass = (hasError) =>
  `${inputBase} ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
      : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
  }`;

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

  const handleCantidad = (delta) => {
    const nueva = Math.min(
      Math.max(1, (producto.cantidadDevolver ?? 1) + delta),
      producto.cantidadComprada
    );
    onChange(producto.codigoBarras, { cantidadDevolver: nueva });
  };

  const fieldError = (campo) => errores?.[campo];

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">

      {/* Nombre + badge estado */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide truncate pr-2">
          {producto.nombre}
        </h4>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0" style={badgeStyle}>
          {producto.estado || '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">

        {/* Motivo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
          </div>
          {fieldError('motivo') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldError('motivo')}
            </p>
          )}
        </div>

        {/* Tipo de devolución */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
          </div>
          {fieldError('tipoDevolucion') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldError('tipoDevolucion')}
            </p>
          )}
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Estado <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={producto.estado ?? ''}
              disabled={!producto.tipoDevolucion}
              onChange={(e) => onChange(producto.codigoBarras, { estado: e.target.value })}
              className={`${selectClass(!!fieldError('estado'))} ${!producto.tipoDevolucion ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccionar...</option>
              {estadosDisponibles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
          </div>
          {fieldError('estado') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldError('estado')}
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleCantidad(-1)}
              disabled={(producto.cantidadDevolver ?? 1) <= 1}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg
                         text-gray-600 hover:bg-gray-100 bg-white
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <input
              type="number"
              min={1}
              max={producto.cantidadComprada}
              value={producto.cantidadDevolver ?? 1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val))
                  onChange(producto.codigoBarras, {
                    cantidadDevolver: Math.min(Math.max(1, val), producto.cantidadComprada),
                  });
              }}
              className="w-14 text-center py-2 text-sm border border-gray-300 rounded-lg
                         outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 font-semibold bg-white"
            />
            <button
              type="button"
              onClick={() => handleCantidad(1)}
              disabled={(producto.cantidadDevolver ?? 1) >= producto.cantidadComprada}
              className="w-9 h-9 flex items-center justify-center border border-[#004D77]
                         bg-[#004D77] text-white rounded-lg hover:bg-[#003a5c]
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
          <p className="text-xs text-gray-400">Máx. {producto.cantidadComprada}</p>
          {fieldError('cantidadDevolver') && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldError('cantidadDevolver')}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
/**
 * ReturnForm — Crear o editar una devolución.
 * Props:
 *   mode        {"create"|"edit"}
 *   purchase    {Object}
 *   devolucion  {Object|null}
 *   onClose     {Function}
 *   onSaved     {Function}
 */
const ReturnForm = ({ mode = 'create', purchase, devolucion, onClose, onSaved }) => {
  const { showConfirm, showSuccess, showError, showWarning } = useAlert();
  const isEdit = mode === 'edit';

  // ── Productos de la compra ────────────────────────────────────────────────
  const productosCompra = useMemo(() =>
    (purchase?.productos ?? []).map((p) => ({
      nombre:           p.nombre     ?? p.producto ?? 'Producto',
      codigoBarras:     p.codigoBarras,
      valorUnit:        p.valorUnit,
      iva:              p.iva ?? 0,
      cantidadComprada: p.cantidad   ?? p.cantidadProductos ?? 1,
    })),
    [purchase]
  );

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
  const [seleccionados, setSeleccionados]     = useState(initState.seleccionados);
  const [datosProducto, setDatosProducto]     = useState(initState.datosProducto);
  const [erroresProducto, setErroresProducto] = useState({});
  const [erroresGenerales, setErroresGenerales] = useState([]);
  const [touched, setTouched]                 = useState(false);

  // ── Cerrar con confirmación si hay datos ──────────────────────────────────
  const handleCerrar = async () => {
    if (seleccionados.size === 0) { onClose(); return; }
    const result = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      isEdit
        ? 'Tienes cambios sin guardar. Si sales ahora perderás todo lo que has modificado.'
        : 'Tienes información ingresada. Si sales ahora perderás todo lo que has ingresado.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Seguir editando' }
    );
    if (result?.isConfirmed) onClose();
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
      onClose();
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

          {/* Panel izquierdo — lista de productos */}
          <div className="w-[42%] shrink-0 flex flex-col overflow-hidden">
            <div className="px-6 pt-5 pb-2 shrink-0">
              <p className="text-sm font-medium text-gray-700 mb-0.5">
                1. Productos a devolver
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {isEdit ? 'Modifica los productos de esta devolución' : 'Escoja los productos que desea devolver'}
              </p>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-3 select-none">
                <input
                  type="checkbox"
                  checked={productosCompra.length > 0 && seleccionados.size === productosCompra.length}
                  onChange={toggleTodos}
                  className="accent-[#004D77] w-4 h-4"
                />
                Seleccionar todos
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-5 flex flex-col gap-2">
              {productosCompra.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-8">
                  Esta compra no tiene productos registrados.
                </p>
              )}
              {productosCompra.map((p) => {
                const isSelected = seleccionados.has(p.codigoBarras);
                const tieneError = productoTieneError(p.codigoBarras, erroresProducto);
                const datos      = datosProducto[p.codigoBarras];
                const { total }  = isSelected && datos
                  ? calcularTotalesProducto(datos)
                  : { total: p.valorUnit * p.cantidadComprada };

                return (
                  <div
                    key={p.codigoBarras}
                    onClick={() => toggleSeleccion(p.codigoBarras)}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors duration-150 ${
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
                        className="accent-[#004D77] w-4 h-4 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <p className="text-xs font-semibold text-gray-800 truncate">{p.nombre}</p>
                          {isSelected && tieneError && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                          {isSelected && !tieneError && touched && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#004D77] shrink-0" strokeWidth={2} />
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-x-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-600">Cant.</span>
                          <span className="font-medium text-gray-600">Precio</span>
                          <span className="font-medium text-gray-600">%IVA</span>
                          <span className="font-medium text-gray-600 text-right">Total</span>
                          <span>{p.cantidadComprada}</span>
                          <span>{formatCurrency(p.valorUnit)}</span>
                          <span>{p.iva}%</span>
                          <span className="text-right font-semibold text-gray-700">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 mt-1">
                (Productos de la compra {purchase?.numeroFacturacion ?? devolucion?.idCompra})
              </p>
            </div>
          </div>

          {/* Panel derecho — configuración por producto */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-5 pb-2 shrink-0">
              <p className="text-sm font-medium text-gray-700 mb-0.5">
                2. Configurar productos seleccionados
              </p>
              <p className="text-xs text-gray-400">
                Gestiona la cantidad, el estado y el motivo de cada producto
              </p>
            </div>

            {erroresGenerales.length > 0 && (
              <div className="mx-6 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                {erroresGenerales.map((e, i) => (
                  <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {e}
                  </p>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 pb-5 flex flex-col gap-3">
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