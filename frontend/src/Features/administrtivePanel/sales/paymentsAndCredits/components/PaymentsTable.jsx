import { Info, DollarSign, Phone, WalletCards } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { highlight } from "../utils/paymentHelpers";
import Permission from "../../../configuration/roles/components/Permission";

export default function PaymentsTable({
  data = [],
  onView,
  onAbonar,
  onContact,
  search = "",
  isSearching = false,
}) {
  // Formato COP
  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  // Highlight que funciona dentro de valores formateados
  const highlightCOP = (value, search) => {
    if (!search) return formatCOP(value);
    const strValue = formatCOP(value);
    const regex = new RegExp(`(${search})`, "gi");
    const parts = strValue.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-blue-200 rounded px-1">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004D77]/10">
          <WalletCards className="h-8 w-8 text-[#004D77]/40" strokeWidth={1.5} />
        </div>

        {isSearching ? (
          <>
            <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
            <p className="max-w-xs text-center text-xs text-gray-400">
              Ninguna cuenta coincide con la búsqueda.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-500">No hay cuentas con crédito registradas</p>
            <p className="max-w-xs text-center text-xs text-gray-400">
              Aún no hay cuentas disponibles para gestionar pagos y abonos.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0 font-lexend">
      <div className="grid gap-3 md:hidden">
        {data.map((item) => {
          const documentNumber =
            item.documento ?? item.document ?? item.doc_number ?? "-";
          const status = item.estado;
          const cupoOcupado = item.saldo ?? 0;
          const creditoAsignado = item.creditoAsignado ?? 0;
          const cupoDisponible = item.cupoDisponible ?? 0;
          const pctOcupado =
            creditoAsignado > 0
              ? Math.min(100, Math.round((cupoOcupado / creditoAsignado) * 100))
              : 0;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400">
                    Documento
                  </p>
                  <h3 className="mt-1 break-words text-sm font-semibold text-[#004D77]">
                    {highlight(documentNumber, search)}
                  </h3>
                </div>

                <StatusBadge status={status} search={search} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Crédito asignado</span>
                  <span className="text-right font-semibold text-gray-700">
                    {highlightCOP(creditoAsignado, search)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Cupo ocupado</span>
                    <span
                      className={`text-right font-semibold ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {highlightCOP(cupoOcupado, search)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pctOcupado >= 90
                          ? "bg-red-500"
                          : pctOcupado >= 60
                            ? "bg-yellow-400"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${pctOcupado}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-gray-400">
                    {pctOcupado}%
                  </p>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Cupo disponible</span>
                  <span
                    className={`text-right font-semibold ${cupoDisponible > 0 ? "text-green-600" : "text-gray-400"}`}
                  >
                    {highlightCOP(cupoDisponible, search)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 border-t border-gray-100 pt-3">
                <Permission permission="pagos_y_abonos.ver_informacion">
                  <button type="button" onClick={() => onView(item.id)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]" title="Ver detalle">
                    <Info className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </Permission>
                <Permission permission="pagos_y_abonos.abonar">
                  {(status === "pendiente" || status === "vencido") && (
                    <button type="button" onClick={() => onAbonar(item.id)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-green-600" title="Registrar abono">
                      <DollarSign className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </Permission>
                <Permission permission="pagos_y_abonos.contactar">
                  {status === "vencido" && (
                    <button type="button" onClick={() => onContact(item)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-red-500" title="Contactar cliente">
                      <Phone className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </Permission>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden min-h-0 min-w-0 w-full flex-1 overflow-x-auto overscroll-x-contain rounded-xl shadow-md [-webkit-overflow-scrolling:touch] md:block">
        <table className="w-full min-w-[760px] table-auto lg:min-w-[860px]">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Cliente
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Crédito Asignado
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Cupo Ocupado
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Cupo Disponible
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const documentNumber =
                item.documento ?? item.document ?? item.doc_number ?? "-";
              const clientName =
                item.nombre ??
                item.fullName ??
                item.name ??
                item.clientName ??
                "-";
              const status = item.estado;
              const cupoOcupado = item.saldo ?? 0;
              const creditoAsignado = item.creditoAsignado ?? 0;
              const cupoDisponible = item.cupoDisponible ?? 0;
              const pctOcupado =
                creditoAsignado > 0
                  ? Math.min(
                      100,
                      Math.round((cupoOcupado / creditoAsignado) * 100),
                    )
                  : 0;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors duration-150 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-blue-50 cursor-pointer`}
                >
                  {/* Documento */}
                  <td className="px-3 py-1 text-[11px] font-medium text-gray-700 max-w-[220px] break-words">
                    {highlight(documentNumber, search)}
                  </td>

                  {/* Cliente */}
                  <td className="px-3 py-1 text-sm text-gray-700 max-w-[220px] break-words">
                    {highlight(clientName, search)}
                  </td>

                  {/* Crédito Asignado */}
                  <td className="px-4 py-2.5 text-sm text-center text-gray-700 font-medium">
                    {highlightCOP(creditoAsignado, search)}
                  </td>

                  {/* Cupo Ocupado */}
                  <td className="px-4 py-2.5 text-sm text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-semibold ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {highlightCOP(cupoOcupado, search)}
                      </span>

                      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pctOcupado >= 90
                              ? "bg-red-500"
                              : pctOcupado >= 60
                                ? "bg-yellow-400"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${pctOcupado}%` }}
                        />
                      </div>

                      <span className="text-gray-400 text-[11px] leading-none">
                        {pctOcupado}%
                      </span>
                    </div>
                  </td>

                  {/* Cupo Disponible */}
                  <td className="px-4 py-2.5 text-sm text-center">
                    <span
                      className={`font-semibold ${cupoDisponible > 0 ? "text-green-600" : "text-gray-400"}`}
                    >
                      {highlightCOP(cupoDisponible, search)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-2.5 text-center">
                    <StatusBadge status={status} search={search} />
                  </td>

                  {/* Funciones */}
                  <td className="px-3 py-1">
                    <div className="flex justify-center gap-1 sm:gap-1.5">
                      <Permission permission="pagos_y_abonos.ver_informacion">
                        <button type="button" onClick={() => onView(item.id)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]" title="Ver detalle">
                          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                      <Permission permission="pagos_y_abonos.abonar">
                        {(status === "pendiente" || status === "vencido") && (
                          <button type="button" onClick={() => onAbonar(item.id)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-green-600" title="Registrar abono">
                            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </Permission>
                      <Permission permission="pagos_y_abonos.contactar">
                        {status === "vencido" && (
                          <button type="button" onClick={() => onContact(item)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-red-500" title="Contactar cliente">
                            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </Permission>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
