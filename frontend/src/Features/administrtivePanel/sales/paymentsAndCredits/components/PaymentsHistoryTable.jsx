import { XCircle } from "lucide-react"

export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete
}) {

  const canCancel = (abono) => {

    if (abono.anulado) return false
    if (!abono.createdAt) return true

    const createdAt = new Date(abono.createdAt)
    const now = new Date()

    const diffHours =
      (now - createdAt) / (1000 * 60 * 60)

    return diffHours <= 48
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl shadow-md font-lexend">

      {/*  min-width controlado */}
      <table className="w-full min-w-[750px] text-sm">

        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2 text-xs whitespace-nowrap">#</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Fecha</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Monto</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Medio</th>
            <th className="px-3 py-2 text-xs whitespace-nowrap">Observaciones</th>
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
                No hay abonos registrados
              </td>
            </tr>
          )}

          {abonos.map((abono, index) => {

            const estado = abono.anulado ? "anulado" : "activo"
            const allowed = canCancel(abono)

            return (
              <tr
                key={abono.id}
                className={`transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >
                <td className="px-3 py-2 text-center">
                  {index + 1}
                </td>

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {abono.fecha}
                </td>

                <td className="px-3 py-2 text-center font-medium whitespace-nowrap">
                  ${new Intl.NumberFormat("es-CO").format(abono.monto)}
                </td>

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {abono.medioPago}
                </td>

                <td
                  className="px-3 py-2 text-center max-w-[200px] truncate"
                  title={abono.observaciones}
                >
                  {abono.observaciones}
                </td>

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {estado === "activo" ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      Pago
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                      Anulado
                    </span>
                  )}
                </td>

                {mode === "payment" && (
                  <td className="px-3 py-2">
                    <div className="flex justify-center items-center">

                      <XCircle
                        size={18}
                        onClick={() => {
                          if (allowed) onDelete(abono) //  enviamos el objeto completo
                        }}
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