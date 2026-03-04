import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, SquarePen, RefreshCw, XCircle, ShoppingCart } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

// ─── Resaltador de texto ──────────────────────────────────────────────────────
function highlight(text, term) {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim()})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">{part}</mark>
      : part
  );
}

// ─── Badge de estado ──────────────────────────────────────────────────────────
const estadoVariants = {
  'Aprobada':          'bg-green-100 text-green-700 border-green-300',
  'Esp. aprobación':   'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Créd. aprobado':    'bg-teal-100 text-teal-700 border-teal-300',
  'Anulada':           'bg-red-100 text-red-400 border-red-200',
  'Desaprobada':       'bg-red-100 text-red-600 border-red-300',
  'Cancelada':         'bg-orange-100 text-orange-600 border-orange-300',
  'Créd. denegado':    'bg-pink-100 text-pink-600 border-pink-300',
};

function EstadoBadge({ estado, term }) {
  const classes = estadoVariants[estado] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  const content = term?.trim() ? highlight(estado, term) : estado;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}>
      {content}
    </span>
  );
}

// ─── Clasificador de permisos por estado ─────────────────────────────────────
const getPermisos = (estado) => {
  // Puede devolver y anular
  if (estado === 'Aprobada' || estado === 'Créd. aprobado') {
    return { puedeDevolver: true, puedeAnular: true, deshabilitado: false };
  }
  // Iconos deshabilitados visualmente, sin interacción
  if (estado === 'Anulada') {
    return { puedeDevolver: false, puedeAnular: false, deshabilitado: true };
  }
  // Muestra error al intentar interactuar
  return { puedeDevolver: false, puedeAnular: false, deshabilitado: false };
};

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <ShoppingCart className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ninguna venta coincide con la búsqueda. Intenta con otro término.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">No hay ventas registradas</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Aún no se han registrado ventas en el sistema. Crea la primera para comenzar.
          </p>
        </>
      )}
    </div>
  );
}

// ─── SalesTable ───────────────────────────────────────────────────────────────
function SalesTable({ data = [], onAnular, search = '', totalData = 0, offset = 0 }) {
  const navigate = useNavigate();
  const { showConfirm, showSuccess, showError } = useAlert();

  // ─── Anular venta ─────────────────────────────────────────────────────────
  const handleAnular = (row) => {
    const { puedeAnular } = getPermisos(row.estado);

    if (!puedeAnular) {
      showError(
        'Anulación no permitida',
        `No es posible anular una venta con estado "${row.estado}".`
      );
      return;
    }

    showConfirm(
      'warning',
      '¿Está seguro que desea anular esta venta?',
      `No. Factura: ${row.factura} — Esta acción no se podrá revertir.`,
      { confirmButtonText: 'Anular', cancelButtonText: 'Cancelar' }
    ).then((result) => {
      if (result.isConfirmed) {
        onAnular?.(row.id);
        showSuccess('Venta anulada', 'La venta ha sido anulada exitosamente.');
      }
    });
  };

  // ─── Generar devolución ───────────────────────────────────────────────────
  const handleDevolucion = (row) => {
    const { puedeDevolver } = getPermisos(row.estado);

    if (!puedeDevolver) {
      showError(
        'Devolución no permitida',
        `No es posible generar una devolución sobre una venta con estado "${row.estado}".`
      );
      return;
    }

    // Se implementará más adelante
    navigate('/admin/sales/devolucion', { state: { sale: row } });
  };

  if (data.length === 0) {
    return <EmptyState isSearching={totalData > 0 && search.trim().length > 0} />;
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">#</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Cliente</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Vendedor</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">No. Factura</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Fecha</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">M. Pago</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Total</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const rowBg                                     = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
            const { puedeDevolver, puedeAnular, deshabilitado } = getPermisos(row.estado);

            return (
              <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>

                <td className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-500 font-medium`}>
                  {offset + index + 1}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap max-w-160px truncate">
                  {highlight(row.cliente, search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap max-w-160px truncate">
                  {highlight(row.vendedor, search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap font-mono">
                  {highlight(String(row.factura), search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.fecha, search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.metodoPago, search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap font-semibold">
                  {highlight(row.total, search)}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <EstadoBadge estado={row.estado} term={search} />
                </td>

                {/* ── Acciones ──────────────────────────────────────────── */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">

                    {/* Ver info — siempre disponible */}
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        navigate('/admin/sales/info-sale', {
                          state: {
                            sale: row,
                            origin: {
                              x: rect.left + rect.width / 2,
                              y: rect.top + rect.height / 2,
                            },
                          },
                        });
                      }}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                      title="Ver información"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* Editar — siempre disponible */}
                    <button
                      onClick={() => navigate('/admin/sales/form-sale', { state: { sale: row } })}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                      title="Editar venta"
                    >
                      <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* Devolución — deshabilitado visualmente si está Anulada, error si otro estado no permitido */}
                    {deshabilitado ? (
                      <span
                        className="text-gray-200 cursor-not-allowed"
                        title="No disponible para ventas anuladas"
                      >
                        <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDevolucion(row)}
                        className={`transition-colors cursor-pointer ${
                          puedeDevolver
                            ? 'text-gray-400 hover:text-amber-500'
                            : 'text-gray-400 hover:text-amber-500'
                        }`}
                        title="Generar devolución"
                      >
                        <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

                    {/* Anular — deshabilitado visualmente si está Anulada, error si otro estado no permitido */}
                    {deshabilitado ? (
                      <span
                        className="text-gray-200 cursor-not-allowed"
                        title="No disponible para ventas anuladas"
                      >
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAnular(row)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Anular venta"
                      >
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

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

export default SalesTable;