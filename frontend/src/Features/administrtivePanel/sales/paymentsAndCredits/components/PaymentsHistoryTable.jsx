import { XCircle } from "lucide-react";
import { useRef, useState } from "react";
import Permission from "../../../configuration/roles/components/Permission";

const CANCELLATION_LIMIT_HOURS = 48;

export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete,
}) {
  const tooltipRef = useRef(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const getUserName = (user) => {
    if (!user) return null;
    if (typeof user === "string") return user;

    const composedName =
      [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    const directName =
      user.nombre ??
      user.fullName ??
      user.name ??
      user.userName ??
      user.username ??
      composedName;

    return directName || getUserName(user.user) || user.email || null;
  };

  const getRegisteredBy = (abono) =>
    getUserName(abono.registeredBy) ??
    "Sin registro";

  const isCancelled = (abono) =>
    abono.isCancelled ?? abono.anulado;

  const canCancel = (abono) => {
    if (isCancelled(abono)) return false;

    const createdAt = abono.createdAt ?? abono.fecha;
    if (!createdAt) return false;

    const createdAtDate = new Date(createdAt);
    if (Number.isNaN(createdAtDate.getTime())) return false;

    const diffHours =
      (new Date() - createdAtDate) /
      (1000 * 60 * 60);

    return diffHours >= 0 && diffHours <= CANCELLATION_LIMIT_HOURS;
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

      <div className="max-h-[220px] overflow-auto">

        <table className="min-w-[760px] w-full">

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
                Registrado por
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
                  colSpan={mode === "payment" ? 7 : 6}
                  className="py-6 text-center text-sm text-gray-400"
                >
                  No hay abonos registrados
                </td>
              </tr>
            )}

            {abonos.map((abono, index) => {
              const allowed = canCancel(abono);
              const displayId = abono.displayId ?? abono.nroAbono ?? "-";

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
                    #{displayId}
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

                  <td className="px-3 py-2 text-xs text-center">
                    {getRegisteredBy(abono)}
                  </td>

                  <td className="px-3 py-2 text-center">

                    {isCancelled(abono) ? (
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
                              {getUserName(abono.cancelledBy) || "Sin registro"}
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
                              {abono.cancellationReason ||
                                abono.motivoCancelacion ||
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
                        <button
                          type="button"
                          onClick={() => allowed && onDelete(abono)}
                          disabled={!allowed}
                          className={`mx-auto transition ${
                            allowed
                              ? "cursor-pointer text-gray-400 hover:scale-110 hover:text-red-500"
                              : "cursor-not-allowed text-gray-200"
                          }`}
                          title={allowed ? "Anular abono" : "No disponible para este abono"}
                        >
                          <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>

                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

        </table>

      </div>

      <div className="px-3 sm:px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <span>
          {abonos.length} abono
          {abonos.length !== 1 ? "s" : ""} registrado
          {abonos.length !== 1 ? "s" : ""}
        </span>

        {abonos.some((a) => isCancelled(a)) && (
          <span className="text-red-500 text-[11px]">
            Incluye registros anulados
          </span>
        )}
      </div>

    </div>
  );
}
