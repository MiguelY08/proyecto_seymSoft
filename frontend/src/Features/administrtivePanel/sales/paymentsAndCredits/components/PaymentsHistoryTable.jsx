import { XCircle } from "lucide-react";
import { useRef, useState } from "react";
import Permission from "../../../configuration/roles/components/Permission";

export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete,
}) {
  const tooltipRef = useRef(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

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

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleMouseEnter = (e, abonoId) => {
    if (tooltipRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      tooltipRef.current.style.left = rect.left - 160 - 16 + "px";
      tooltipRef.current.style.top = rect.top + rect.height / 2 + "px";
      tooltipRef.current.style.transform = "translateY(-50%)";
    }
    setActiveTooltip(abonoId);
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">

      <div className="max-h-[220px] overflow-y-auto">

        <table className="w-full">

          <thead className="sticky top-0 z-10 bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold text-center">
                Nro Abono
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Fecha Abono
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Monto Abonado
              </th>

              <th className="px-3 py-2 text-xs font-semibold text-center">
                Medio de Pago
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
                      <div 
                        className="relative inline-block"
                        onMouseEnter={(e) => handleMouseEnter(e, abono.id)}
                        onMouseLeave={handleMouseLeave}
                      >

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600 cursor-help">
                          Anulado
                        </span>

                        <div
                          ref={tooltipRef}
                          className={`
                            fixed
                            z-[9999]
                            w-[160px]
                            bg-[#0F172A]
                            text-white
                            rounded-lg
                            shadow-xl
                            px-2
                            py-1.5
                            transition-all
                            duration-150
                            ${activeTooltip === abono.id ? 'opacity-100 visible' : 'opacity-0 invisible'}
                          `}
                          style={{
                            pointerEvents: activeTooltip === abono.id ? 'auto' : 'none'
                          }}
                        >
                          <div className="text-center space-y-0.5">

                            <p className="font-medium text-[10px]">
                              {abono.cancelledBy?.nombre || "N/A"}
                            </p>

                            <p className="text-[9px] text-slate-300">
                              {abono.cancelledAt
                                ? new Date(
                                    abono.cancelledAt
                                  ).toLocaleDateString(
                                    "es-CO"
                                  )
                                : "N/A"}
                            </p>

                            <div className="h-px bg-slate-700 my-0.5" />

                            <p className="text-[9px] break-words">
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

                      <Permission permission="pagos_y_abonos.anular">
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
                      </Permission>

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
