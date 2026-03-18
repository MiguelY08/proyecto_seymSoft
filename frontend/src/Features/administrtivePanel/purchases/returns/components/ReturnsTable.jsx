import React, { useState, useRef, useCallback } from 'react';
import { Info, SquarePen, XCircle, PackageX } from 'lucide-react';
import {
  getBadgeEstadoDevolucion,
  getBadgeEstadoProducto,
  calcularTotalesProducto,
  formatCurrency,
} from '../helpers/returnsHelpers';

/**
 * Función highlight.
 * Resalta el texto buscado en una cadena, envolviéndolo en un span con estilo.
 * @param {string} text - Texto original a resaltar.
 * @param {string} search - Término de búsqueda.
 * @returns {string|JSX.Element} Texto con resaltado o '-' si no hay texto.
 */
const highlight = (text, search) => {
  if (!search || !text) return text ?? '-';
  const str   = String(text);
  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = str.split(regex);
  if (parts.length === 1) return str;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {part}
      </span>
    ) : part
  );
};

/**
 * Componente EstadoBadge.
 * Muestra un badge con el estado de la devolución, usando estilos dinámicos.
 * @param {object} props - Props del componente.
 * @param {string} props.estado - Estado de la devolución.
 * @returns {JSX.Element} Badge con estilo basado en el estado.
 */
const EstadoBadge = ({ estado }) => {
  const style = getBadgeEstadoDevolucion(estado);
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={style}
    >
      {estado ?? '-'}
    </span>
  );
};

/**
 * Hook useTooltipPos.
 * Calcula la posición óptima para un tooltip flotante, evitando salirse del viewport.
 * @returns {object} Objeto con ref, pos, show y hide.
 */
function useTooltipPos() {
  const [pos, setPos] = useState(null);
  const ref           = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const rect  = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp     = spaceBelow < 180 && spaceAbove > spaceBelow;
    setPos({
      left:  Math.min(rect.left, window.innerWidth - 240),
      top:   openUp ? rect.top - 8   : rect.bottom + 8,
      openUp,
    });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return { ref, pos, show, hide };
}

/**
 * Componente FloatingTooltip.
 * Tooltip flotante genérico, posicionado fixed sobre el viewport.
 * @param {object} props - Props del componente.
 * @param {object} props.pos - Posición calculada para el tooltip.
 * @param {JSX.Element} props.children - Contenido del tooltip.
 * @returns {JSX.Element|null} Tooltip renderizado o null si no hay posición.
 */
const FloatingTooltip = ({ pos, children }) => {
  if (!pos) return null;
  return (
    <div
      className="fixed z-9999 min-w-220px max-w-280px rounded-xl shadow-2xl p-3 pointer-events-none"
      style={{
        background:  '#1e293b',
        left:        pos.left,
        top:         pos.openUp ? undefined : pos.top,
        bottom:      pos.openUp ? window.innerHeight - pos.top : undefined,
        transform:   'translateY(0)',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Componente ProductosTooltip.
 * Tooltip que muestra la lista de productos a devolver con cantidades.
 * @param {object} props - Props del componente.
 * @param {Array} props.productos - Lista de productos.
 * @param {string} props.search - Término de búsqueda para resaltar.
 * @returns {JSX.Element} Tooltip con productos o texto vacío.
 */
const ProductosTooltip = ({ productos, search }) => {
  const { ref, pos, show, hide } = useTooltipPos();

  if (!productos?.length)
    return <span className="text-gray-400 text-xs">—</span>;

  const names  = productos.map((p) => p.nombre);
  const preview = names.slice(0, 2).join(', ');
  const label   = nombres => nombres.length > 2 ? `${preview}...` : preview;

  return (
    <>
      <div
        ref={ref}
        className="flex items-center gap-1.5 cursor-default justify-center"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <span className="text-xs text-gray-700 max-w-160px truncate">
          {/* highlight en el preview */}
          {highlight(names.slice(0, 2).join(', ') + (productos.length > 2 ? '...' : ''), search)}
        </span>
        <Info className="w-3 h-3 text-gray-400 shrink-0" strokeWidth={1.5} />
      </div>

      <FloatingTooltip pos={pos}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>
          Productos a devolver
        </p>
        <ul className="flex flex-col gap-1">
          {productos.map((p, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 text-xs"
              style={{ color: '#f1f5f9' }}
            >
              <span className="truncate max-w-160p]">• {p.nombre}</span>
              <span className="font-semibold shrink-0 ml-1" style={{ color: '#93c5fd' }}>
                ×{p.cantidadDevolver ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </FloatingTooltip>
    </>
  );
};

/**
 * Componente EstadoTooltip.
 * Tooltip que muestra el estado general y el detalle de estados por producto.
 * @param {object} props - Props del componente.
 * @param {object} props.devolucion - Objeto de devolución con productos.
 * @returns {JSX.Element} Badge con tooltip o solo badge.
 */
const EstadoTooltip = ({ devolucion }) => {
  const { ref, pos, show, hide } = useTooltipPos();

  const productos = devolucion?.productos ?? [];
  if (!productos.length) {
    return <EstadoBadge estado={devolucion?.estado} />;
  }

  // Agrupar conteos por estado de producto
  const conteos = productos.reduce((acc, p) => {
    const e = p.estado ?? 'Sin estado';
    acc[e]  = (acc[e] ?? 0) + 1;
    return acc;
  }, {});

  // Orden de visualización
  const ORDEN = [
    'Pend. envío',
    'Pend. reemplazo',
    'Pend. reembolso',
    'Recibido',
    'Enviado',
  ];

  const entriesOrdenadas = [
    ...ORDEN.filter((e) => conteos[e]).map((e) => [e, conteos[e]]),
    ...Object.entries(conteos).filter(([e]) => !ORDEN.includes(e)),
  ];

  // Color del punto indicador por estado de producto
  const dotColor = (estado) => {
    const s = getBadgeEstadoProducto(estado);
    return s.color;
  };

  return (
    <>
      <div
        ref={ref}
        className="inline-flex items-center gap-1 cursor-default justify-center"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <EstadoBadge estado={devolucion?.estado} />
      </div>

      <FloatingTooltip pos={pos}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>
          Estados de productos
        </p>
        <ul className="flex flex-col gap-1.5">
          {entriesOrdenadas.map(([estado, count]) => {
            const color = dotColor(estado);
            return (
              <li
                key={estado}
                className="flex items-center justify-between gap-3 text-xs"
                style={{ color: '#f1f5f9' }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{estado}</span>
                </div>
                <span className="font-semibold shrink-0" style={{ color: '#93c5fd' }}>
                  {count} de {productos.length}
                </span>
              </li>
            );
          })}
        </ul>
      </FloatingTooltip>
    </>
  );
};

/**
 * Componente EmptyState.
 * Muestra estado vacío cuando no hay devoluciones o resultados de búsqueda.
 * @param {object} props - Props del componente.
 * @param {boolean} props.isSearching - Indica si se está buscando.
 * @returns {JSX.Element} Mensaje de estado vacío.
 */
function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <PackageX className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ninguna devolución coincide con los filtros aplicados. Intenta con otros criterios.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">No hay devoluciones registradas</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Las devoluciones se crean desde el módulo de Compras, al gestionar una factura.
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Componente ReturnsTable.
 * Tabla principal para mostrar devoluciones con tooltips, acciones y paginación.
 * @param {object} props - Props del componente.
 * @param {Array} props.currentData - Datos actuales de devoluciones a mostrar.
 * @param {string} props.search - Término de búsqueda.
 * @param {boolean} props.isSearching - Indica si hay búsqueda activa.
 * @param {number} props.offset - Offset para numeración de filas.
 * @param {function} props.onViewDetail - Función para ver detalle.
 * @param {function} props.onEdit - Función para editar.
 * @param {function} props.onAnnul - Función para anular.
 * @returns {JSX.Element} Tabla con devoluciones o estado vacío.
 */
function ReturnsTable({
  currentData,
  search,
  isSearching,
  offset,
  onViewDetail,
  onEdit,
  onAnnul,
}) {
  // Verificar si se puede editar o anular basado en estado
  const canEdit  = (d) => d.estado !== 'Anulada' && !d.estado?.startsWith('Procesada');
  const canAnnul = (d) => d.estado !== 'Anulada' && !d.estado?.startsWith('Procesada');

  if (currentData.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">

        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">#</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">No. Devolución</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">No. Factura</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">F. Devolución</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Productos</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Devolver</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((devolucion, index) => {
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';

            // Total de unidades a devolver
            const totalUnidades = (devolucion.productos ?? []).reduce(
              (sum, p) => sum + (p.cantidadDevolver ?? 0), 0
            );

            return (
              <tr key={devolucion.id} className={`transition-colors duration-150 ${rowBg}`}>

                {/* # */}
                <td className="px-3 py-1.5 text-center text-xs text-gray-500 font-medium">
                  {offset + index + 1}
                </td>

                {/* No. Devolución — SIN columna, se muestra con No. Factura */}
                {/* No. Factura */}
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap font-medium">
                  {highlight(devolucion.id, search)}
                </td>

                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(devolucion.idCompra, search)}
                </td>

                {/* Fecha */}
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(devolucion.fechaDevolucion, search)}
                </td>

                {/* Productos con tooltip */}
                <td className="px-3 py-1.5 text-xs">
                  <ProductosTooltip productos={devolucion.productos} search={search} />
                </td>

                {/* Total unidades a devolver */}
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 font-semibold whitespace-nowrap">
                  {highlight(String(totalUnidades), search)}
                </td>

                {/* Estado con tooltip */}
                <td className="px-3 py-1.5 text-center">
                  <EstadoTooltip devolucion={devolucion} />
                </td>

                {/* Acciones */}
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">

                    {/* Ver detalle */}
                    <button
                      onClick={() => onViewDetail(devolucion)}
                      title="Ver detalle"
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => canEdit(devolucion) && onEdit?.(devolucion)}
                      title={
                        devolucion.estado === 'Anulada'
                          ? 'No se puede editar una devolución anulada'
                          : devolucion.estado?.startsWith('Procesada')
                          ? 'No se puede editar una devolución procesada'
                          : 'Editar devolución'
                      }
                      disabled={!canEdit(devolucion)}
                      className={`transition ${
                        canEdit(devolucion)
                          ? 'text-gray-400 hover:scale-110 hover:text-[#004D77] cursor-pointer'
                          : 'text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>

                    {/* Anular */}
                    <button
                      onClick={() => canAnnul(devolucion) && onAnnul(devolucion)}
                      title={
                        devolucion.estado === 'Anulada'
                          ? 'Esta devolución ya fue anulada'
                          : devolucion.estado?.startsWith('Procesada')
                          ? 'No se puede anular una devolución procesada'
                          : 'Anular devolución'
                      }
                      disabled={!canAnnul(devolucion)}
                      className={`transition ${
                        canAnnul(devolucion)
                          ? 'text-gray-400 hover:scale-110 hover:text-red-500 cursor-pointer'
                          : 'text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ReturnsTable;