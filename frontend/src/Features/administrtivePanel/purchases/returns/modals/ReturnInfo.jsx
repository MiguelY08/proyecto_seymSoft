import React, { useState, useMemo } from 'react';
import { X, SquarePen, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getBadgeEstadoDevolucion,
  getBadgeEstadoProducto,
  calcularTotalesProducto,
  formatCurrency,
} from '../helpers/returnsHelpers';

// ─── Badge genérico ───────────────────────────────────────────────────────────
const Badge = ({ label, style }) => (
  <span
    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
    style={style}
  >
    {label ?? '-'}
  </span>
);

// ─── Fila de info general (estilo InfoUser) ───────────────────────────────────
const InfoRow = ({ label, children }) => (
  <div className="flex flex-col py-3 gap-0.5">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    {children}
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
/**
 * ReturnInfo — Modal de solo lectura para una devolución.
 * Props:
 *   devolucion  {Object}   - datos completos de la devolución
 *   onClose     {Function} - cierra el modal
 *   onEdit      {Function} - opcional, abre el formulario en modo edición
 */
const ReturnInfo = ({ devolucion, onClose, onEdit }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const POR_PAGINA = 4;

  const productos  = devolucion?.productos ?? [];
  const isAnulada  = devolucion?.estado === 'Anulada';
  const canEdit    = !isAnulada && !devolucion?.estado?.startsWith('Procesada');
  const estadoStyle = getBadgeEstadoDevolucion(devolucion?.estado);

  // ── Paginación de productos ────────────────────────────────────────────────
  const totalPaginas    = Math.max(1, Math.ceil(productos.length / POR_PAGINA));
  const productosPagina = useMemo(() => {
    const start = (paginaActual - 1) * POR_PAGINA;
    return productos.slice(start, start + POR_PAGINA);
  }, [paginaActual, productos]);

  // ── Totales ────────────────────────────────────────────────────────────────
  const { totalSubtotal, totalIva, totalGeneral } = useMemo(() =>
    productos.reduce(
      (acc, p) => {
        const { subtotal, ivaValor, total } = calcularTotalesProducto(p);
        return {
          totalSubtotal: acc.totalSubtotal + subtotal,
          totalIva:      acc.totalIva      + ivaValor,
          totalGeneral:  acc.totalGeneral  + total,
        };
      },
      { totalSubtotal: 0, totalIva: 0, totalGeneral: 0 }
    ),
  [productos]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">Detalle de Devolución</h2>
            <span className="text-white/60 text-xs">{devolucion?.id ?? '—'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col">

          {/* Info general — filas estilo InfoUser */}
          <div className="flex flex-col divide-y divide-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
              <InfoRow label="No. Devolución">
                <span className="text-sm font-medium text-gray-800">{devolucion?.id ?? '—'}</span>
              </InfoRow>
              <InfoRow label="No. Factura">
                <span className="text-sm font-medium text-gray-800">{devolucion?.idCompra ?? '—'}</span>
              </InfoRow>
              <InfoRow label="Fecha">
                <span className="text-sm font-medium text-gray-800">{devolucion?.fechaDevolucion ?? '—'}</span>
              </InfoRow>
              <InfoRow label="Estado">
                <Badge label={devolucion?.estado} style={estadoStyle} />
              </InfoRow>
            </div>
          </div>

          {/* ── Banner de anulación — solo si está anulada ───────────────── */}
          {isAnulada && (
            <div
              className="flex gap-2.5 items-start rounded-lg px-4 py-3 text-xs mb-3"
              style={{ backgroundColor: '#fff1f2', border: '1px solid #fecaca' }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#b91c1c' }} strokeWidth={1.8} />
              <div>
                <p className="font-semibold mb-0.5" style={{ color: '#b91c1c' }}>Motivo de anulación</p>
                <p style={{ color: '#7f1d1d' }}>
                  {devolucion?.motivoAnulacion ?? 'Sin motivo registrado.'}
                </p>
                {devolucion?.fechaAnulacion && (
                  <p className="mt-1" style={{ color: '#9f1239' }}>
                    Anulada el {devolucion.fechaAnulacion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tabla de productos */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Productos ({productos.length})
            </p>

            <div className="rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Producto</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Motivo</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tipo</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Estado</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Cant.</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">V. Unit</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">IVA</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productosPagina.map((p, i) => {
                    const { ivaValor, total } = calcularTotalesProducto(p);
                    const estadoPStyle        = getBadgeEstadoProducto(p.estado);
                    return (
                      <tr
                        key={i}
                        className={`transition-colors duration-150 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                      >
                        <td className="px-3 py-2 font-medium text-gray-800 max-w-130px truncate">{p.nombre ?? '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{p.motivo ?? '-'}</td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{p.tipoDevolucion ?? '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge label={p.estado} style={estadoPStyle} />
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-gray-700">{p.cantidadDevolver ?? '-'}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(p.valorUnit)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(ivaValor)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Totales — siempre visibles, fuera de la paginación ──────── */}
            <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subtotal</span>
                <span className="text-xs font-semibold text-gray-700">{formatCurrency(totalSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">IVA</span>
                <span className="text-xs font-semibold text-gray-700">{formatCurrency(totalIva)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: '#f0f9ff' }}>
                <span className="text-sm font-bold text-gray-600">Total devolución</span>
                <span className="text-sm font-bold" style={{ color: '#004D77' }}>{formatCurrency(totalGeneral)}</span>
              </div>
            </div>

            {/* Paginador de productos */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-gray-400">Página {paginaActual} de {totalPaginas}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200
                               text-gray-500 bg-white hover:border-[#004D77] hover:text-[#004D77]
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200
                               text-gray-500 bg-white hover:border-[#004D77] hover:text-[#004D77]
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          {canEdit && onEdit && (
            <button
              onClick={() => { onClose(); onEdit(devolucion); }}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
            >
              <SquarePen className="w-4 h-4" strokeWidth={1.8} />
              Editar devolución
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReturnInfo;