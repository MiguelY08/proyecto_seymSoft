import { XCircle } from "lucide-react"

export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete
}) {

  const canCancel = (abono) => {
    if (abono.anulado) return false
    if (!abono.createdAt) return true

    const diffHours =
      (new Date() - new Date(abono.createdAt)) / (1000 * 60 * 60)

    return diffHours <= 48
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">

      <table className="min-w-max w-full">

        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-xs font-semibold text-center">Nro Abono</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-center">Fecha</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-center">Monto</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-center">Medio de Pago</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-center">Observación</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-center">Estado</th>

            {mode === "payment" && (
              <th className="px-3 py-2.5 text-xs font-semibold text-center">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody>

          {abonos.length === 0 && (
            <tr>
              <td colSpan={mode === "payment" ? 7 : 6}
                  className="text-center py-8 text-gray-400 text-sm">
                No hay abonos registrados
              </td>
            </tr>
          )}

          {abonos.map((abono, index) => {

            const allowed = canCancel(abono)
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100"

            return (
              <tr key={abono.id} className={`transition-colors duration-150 ${rowBg}`}>

                <td className="px-3 py-2 text-xs text-center font-medium">
                  #{abono.nroAbono ?? index + 1}
                </td>

                <td className="px-3 py-2 text-xs text-center whitespace-nowrap">
                  {abono.fecha}
                </td>

                <td className="px-3 py-2 text-xs text-center font-semibold">
                  ${new Intl.NumberFormat("es-CO").format(abono.monto)}
                </td>

                <td className="px-3 py-2 text-xs text-center">
                  {abono.medioPago ?? "-"}
                </td>

                <td
                  className="px-3 py-2 text-xs text-center max-w-[220px] truncate"
                  title={abono.observacion}
                >
                  {abono.observacion || "-"}
                </td>

                <td className="px-3 py-2 text-center">
                  {abono.anulado ? (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-600 font-semibold">
                      Anulado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-600 font-semibold">
                      Activo
                    </span>
                  )}
                </td>

                {mode === "payment" && (
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">

                      <XCircle
                        size={16}
                        onClick={() => { if (allowed) onDelete(abono) }}
                        className={`transition ${
                          allowed
                            ? "text-gray-400 hover:scale-110 hover:text-red-500 cursor-pointer"
                            : "text-gray-200 cursor-not-allowed"
                        }`}
                      />

                    </div>
                  </td>
                )}

              </tr>
            )
          })}

        </tbody>
      </table>

    </div>
  )
}