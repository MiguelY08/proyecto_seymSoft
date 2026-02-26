import { XCircle } from "lucide-react"

export default function PaymentHistoryTable({
  abonos = [],
  mode = "view",
  onDelete
}) {

  return (
    <div className="overflow-x-auto rounded-xl shadow-md">

      <table className="min-w-full text-sm">

        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2 text-xs">#</th>
            <th className="px-3 py-2 text-xs">Fecha Abono</th>
            <th className="px-3 py-2 text-xs">Monto</th>
            <th className="px-3 py-2 text-xs">Estado</th>
            {mode === "payment" && (
              <th className="px-3 py-2 text-xs">Funciones</th>
            )}
          </tr>
        </thead>

        <tbody>

          {abonos.length === 0 && (
            <tr>
              <td
                colSpan={mode === "payment" ? 5 : 4}
                className="text-center py-4 text-gray-400"
              >
                No hay abonos registrados
              </td>
            </tr>
          )}

          {abonos.map((abono, index) => {

            const estado = abono.anulado ? "anulado" : "activo"

            return (
              <tr
                key={abono.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >
                <td className="px-3 py-2 text-center">
                  {index + 1}
                </td>

                <td className="px-3 py-2 text-center">
                  {abono.fecha}
                </td>

                <td className="px-3 py-2 text-center">
                  ${abono.monto.toLocaleString()}
                </td>

                <td className="px-3 py-2 text-center">
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
                  <td className="px-3 py-2 text-center">
                    {!abono.anulado && (
                      <XCircle
                        size={16}
                        className="cursor-pointer text-red-400 hover:scale-110 transition hover:text-red-600"
                        onClick={() => onDelete(abono.id)}
                      />
                    )}
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