import { XCircle } from "lucide-react"

/*
  Tabla de abonos de UNA factura.

  Props:
    abonos   → array de abonos de la factura seleccionada
    mode     → "view" | "payment"
               "view"    → solo lectura, sin columna Funciones
               "payment" → muestra icono de anular en cada fila
    onDelete → (abono) => void — se dispara al click en anular
               Solo se activa si el abono cumple la regla de 48h
*/
export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete
}) {

  // Determina si un abono puede anularse según la regla de 48 horas
  const canCancel = (abono) => {
    if (abono.anulado) return false
    if (!abono.createdAt) return true

    const diffHours = (new Date() - new Date(abono.createdAt)) / (1000 * 60 * 60)
    return diffHours <= 48
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl shadow-md font-lexend">

      <table className="w-full min-w-[750px] text-sm">

        <thead className="bg-[#004D77] text-white">
          <tr>
            {/* nroAbono: correlativo legible dentro de la factura */}
            <th className="px-3 py-2 text-xs whitespace-nowrap">Nro Abono</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Fecha</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Monto</th>
            {/* medioPago: Efectivo | Transferencia | Tarjeta | Cheque */}
            <th className="px-3 py-2 text-xs whitespace-nowrap">Medio de Pago</th>
            {/* observacion: nota libre del cajero (campo renombrado del modelo) */}
            <th className="px-3 py-2 text-xs whitespace-nowrap">Observación</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Estado</th>
            {mode === "payment" && (
              <th className="px-3 py-2 text-xs text-center whitespace-nowrap">
                Funciones
              </th>
            )}
          </tr>
        </thead>

        <tbody>

          {abonos.length === 0 && (
            <tr>
              <td
                colSpan={mode === "payment" ? 7 : 6}
                className="text-center py-6 text-gray-400"
              >
                No hay abonos registrados para esta factura
              </td>
            </tr>
          )}

          {abonos.map((abono, index) => {

            const allowed = canCancel(abono)

            return (
              <tr
                key={abono.id}
                className={`transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >

                {/* nroAbono: correlativo del abono dentro de la factura */}
                <td className="px-3 py-2 text-center font-medium">
                  #{abono.nroAbono ?? index + 1}
                </td>

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {abono.fecha}
                </td>

                <td className="px-3 py-2 text-center font-medium whitespace-nowrap">
                  ${new Intl.NumberFormat("es-CO").format(abono.monto)}
                </td>

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {abono.medioPago ?? "-"}
                </td>

                {/* observacion → campo correcto del nuevo modelo (antes era observaciones) */}
                <td
                  className="px-3 py-2 text-center max-w-[200px] truncate"
                  title={abono.observacion}
                >
                  {abono.observacion || "-"}
                </td>

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {abono.anulado ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                      Anulado
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      Activo
                    </span>
                  )}
                </td>

                {mode === "payment" && (
                  <td className="px-3 py-2">
                    <div className="flex justify-center items-center">
                      <XCircle
                        size={18}
                        onClick={() => { if (allowed) onDelete(abono) }}
                        className={`transition duration-200 ${
                          allowed
                            ? "cursor-pointer text-gray-400 hover:scale-110 hover:text-red-600"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        title={
                          abono.anulado
                            ? "Este abono ya fue anulado"
                            : allowed
                              ? "Anular abono"
                              : "No se puede anular después de 48 horas"
                        }
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