import { XCircle } from "lucide-react";

export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete,
}) {
  const canCancel = (abono) => {
    if (abono.anulado) return false;
    if (!abono.createdAt) return true;

    const diffHours =
      (new Date() - new Date(abono.createdAt)) /
      (1000 * 60 * 60);

    return diffHours <= 48;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO").format(value || 0);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("es-CO");
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">

      <div className="max-h-[220px] overflow-y-auto">

        <table className="w-full">

          <thead className="sticky top-0 z-10 bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold text-center">
                #
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Fecha
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Monto
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Medio
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Estado
              </th>

              {mode === "payment" && (
                <th className="px-3 py-2 text-xs font-semibold text-center">
                  Acción
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {abonos.length === 0 && (
              <tr>
                <td
                  colSpan={mode === "payment" ? 6 : 5}
                  className="py-6 text-center text-sm text-gray-400"
                >
                  No hay abonos registrados
                </td>
              </tr>
            )}

            {abonos.map((abono, index) => {
              const allowed = canCancel(abono);

              return (
                <tr
                  key={abono.id}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  } hover:bg-[#004d7708]`}
                >
                  <td className="px-3 py-2 text-xs text-center font-medium">
                    #{abono.nroAbono}
                  </td>

                  <td className="px-3 py-2 text-xs text-center">
                    {formatDate(abono.fecha)}
                  </td>

                  <td className="px-3 py-2 text-xs text-center font-semibold">
                    $
                    {formatCurrency(abono.monto)}
                  </td>

                  <td className="px-3 py-2 text-xs text-center">
                    {abono.medioPago}
                  </td>

                  <td className="px-3 py-2 text-center">

                    {abono.anulado ? (
                      <div className="relative inline-block group">

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600 cursor-help">
                          Anulado
                        </span>

                        <div
                          className="
                            invisible
                            opacity-0
                            group-hover:visible
                            group-hover:opacity-100
                            transition-all
                            duration-150
                            absolute
                            left-1/2
                            -translate-x-1/2
                            bottom-full
                            mb-2
                            z-50
                            min-w-[180px]
                            max-w-[220px]
                            bg-[#0F172A]
                            text-white
                            rounded-lg
                            shadow-xl
                            px-3
                            py-2
                          "
                        >
                          <div className="text-center space-y-1">

                            <p className="font-medium text-[11px]">
                              {abono.cancelledBy?.nombre || "N/A"}
                            </p>

                            <p className="text-[10px] text-slate-300">
                              {abono.cancelledAt
                                ? new Date(
                                    abono.cancelledAt
                                  ).toLocaleDateString(
                                    "es-CO"
                                  )
                                : "N/A"}
                            </p>

                            <div className="h-px bg-slate-700 my-1" />

                            <p className="text-[10px] break-words">
                              {abono.motivoCancelacion ||
                                "Sin motivo"}
                            </p>

                          </div>
                        </div>

                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-600">
                        Activo
                      </span>
                    )}

                  </td>

                  {mode === "payment" && (
                    <td className="px-3 py-2 text-center">

                      <XCircle
                        size={15}
                        onClick={() => {
                          if (allowed) {
                            onDelete(abono);
                          }
                        }}
                        className={`mx-auto transition ${
                          allowed
                            ? "text-gray-400 hover:text-red-500 hover:scale-110 cursor-pointer"
                            : "text-gray-200 cursor-not-allowed"
                        }`}
                      />

                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

        </table>

      </div>

      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>
          {abonos.length} abono
          {abonos.length !== 1 ? "s" : ""} registrado
          {abonos.length !== 1 ? "s" : ""}
        </span>

        {abonos.some((a) => a.anulado) && (
          <span className="text-red-500 text-[11px]">
            Incluye registros anulados
          </span>
        )}
      </div>

    </div>
  );
}