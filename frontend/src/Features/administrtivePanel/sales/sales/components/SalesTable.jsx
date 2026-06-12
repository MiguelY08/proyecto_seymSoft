import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Info,
  SquarePen,
  RefreshCw,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { highlight } from "../helpers/salesHelpers";
import Spinner from "../../../../shared/spinner";

const estadoVariants = {
  Aprobada: "bg-green-100 text-green-700 border-green-300",
  "Esp. aprobacion": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Anulada: "bg-red-100 text-red-400 border-red-200",
  Denegada: "bg-red-100 text-red-600 border-red-300",
  Cancelada: "bg-orange-100 text-orange-600 border-orange-300",
};

function EstadoBadge({ estado, term }) {
  const label = estado || "-";
  const classes =
    estadoVariants[label] ?? "bg-gray-100 text-gray-600 border-gray-300";
  const content = term?.trim() ? highlight(label, term) : label;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}
    >
      {content}
    </span>
  );
}

const getPermisos = (estado) => {
  if (estado === "Aprobada") {
    return { puedeDevolver: true, puedeAnular: true, deshabilitado: false };
  }

  if (estado === "Anulada") {
    return { puedeDevolver: false, puedeAnular: false, deshabilitado: true };
  }

  return { puedeDevolver: false, puedeAnular: false, deshabilitado: false };
};

function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <ShoppingCart
          className="w-10 h-10 text-[#004D77]/40"
          strokeWidth={1.5}
        />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">
            No se encontraron resultados
          </p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ninguna venta coincide con la busqueda. Intenta con otro termino.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">
            No hay ventas registradas
          </p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Aun no se han registrado ventas en el sistema. Crea la primera para
            comenzar.
          </p>
        </>
      )}
    </div>
  );
}

function TableText({ value, fallback, search, className = "" }) {
  if (!value || value === "-") {
    return <span className="italic text-gray-400">{fallback}</span>;
  }

  return <span className={className}>{highlight(value, search)}</span>;
}

function SalesTable({ data = [], search = "", totalData = 0 }) {
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [loadingMessage, setLoadingMessage] = useState("");

  const navigateWithSpinner = (message, to, options) => {
    setLoadingMessage(message);
    window.setTimeout(() => {
      navigate(to, options);
    }, 80);
  };

  const handleAnular = (row) => {
    const { puedeAnular } = getPermisos(row.estado);

    if (!puedeAnular) {
      showError(
        "Anulacion no permitida",
        `No es posible anular una venta con estado "${row.estado}".`,
      );
      return;
    }

    navigate("/admin/sales/annular-sale", { state: { sale: row } });
  };

  const handleDevolucion = (row) => {
    const { puedeDevolver } = getPermisos(row.estado);

    if (!puedeDevolver) {
      showError(
        "Devolucion no permitida",
        `No es posible generar una devolucion sobre una venta con estado "${row.estado}".`,
      );
      return;
    }

    navigate("/admin/sales/returns-s", { state: { sale: row } });
  };

  if (data.length === 0) {
    return (
      <EmptyState isSearching={totalData > 0 && search.trim().length > 0} />
    );
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      {loadingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Spinner message={loadingMessage} className="min-h-0" />
        </div>
      )}

      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">
              No. Factura
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Cliente
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Vendedor
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Fecha
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              M. Pago
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Total
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Estado
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const rowBg =
              index % 2 === 0
                ? "bg-gray-100 hover:bg-blue-50"
                : "bg-white hover:bg-blue-50";
            const { puedeDevolver, puedeAnular, deshabilitado } = getPermisos(
              row.estado,
            );

            return (
              <tr
                key={row.id || row.idSale || row.factura}
                className={`transition-colors duration-150 ${rowBg}`}
              >
                <td
                  className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap font-mono`}
                >
                  {highlight(String(row.factura || row.id || "-"), search)}
                </td>

                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap">
                  <TableText
                    value={row.cliente}
                    fallback="Cliente no disponible"
                    search={search}
                  />
                </td>

                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  <TableText
                    value={row.vendedor}
                    fallback="Vendedor no disponible"
                    search={search}
                  />
                </td>

                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.fecha || "-", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.metodoPago || "-", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap font-semibold">
                  {highlight(row.total || "0", search)}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <EstadoBadge estado={row.estado} term={search} />
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        navigateWithSpinner("Cargando detalles de la venta...", "/admin/sales/info-sale", {
                          state: {
                            sale: row,
                            origin: {
                              x: rect.left + rect.width / 2,
                              y: rect.top + rect.height / 2,
                            },
                          },
                        });
                      }}
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      title="Ver informacion"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {deshabilitado ? (
                      <span
                        className="text-gray-200 cursor-not-allowed"
                        title="No disponible para ventas anuladas"
                      >
                        <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          navigateWithSpinner("Cargando edicion de la venta...", "/admin/sales/edit-sale", {
                            state: { sale: row },
                          })
                        }
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Editar venta"
                      >
                        <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

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
                        className={`transition ${
                          puedeDevolver
                            ? "text-gray-400 hover:scale-110 hover:text-amber-500 cursor-pointer"
                            : "text-gray-200 cursor-not-allowed"
                        }`}
                        title={
                          puedeDevolver
                            ? "Generar devolucion"
                            : "Devolucion no disponible"
                        }
                      >
                        <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

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
                        className={`transition ${
                          puedeAnular
                            ? "text-gray-400 hover:scale-110 hover:text-red-500 cursor-pointer"
                            : "text-gray-200 cursor-not-allowed"
                        }`}
                        title={
                          puedeAnular
                            ? "Anular venta"
                            : "Anulacion no disponible"
                        }
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
