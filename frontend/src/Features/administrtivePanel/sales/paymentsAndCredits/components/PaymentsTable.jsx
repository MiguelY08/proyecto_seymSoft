import { Info, DollarSign, Phone } from "lucide-react"
import StatusBadge from "./StatusBadge"

export default function PaymentsTable({
  data = [],
  onView,
  onAbonar,
  onContact
}) {

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md font-lexend">

      <table className="min-w-max w-full">

        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2 text-xs">#</th>
            <th className="px-3 py-2 text-xs">Nombre</th>
            <th className="px-3 py-2 text-xs">Valor Crédito</th>
            <th className="px-3 py-2 text-xs">Fecha Crédito</th>
            <th className="px-3 py-2 text-xs">Saldo</th>
            <th className="px-3 py-2 text-xs">Estado</th>
            <th className="px-3 py-2 text-xs">Funciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => {

            const status = item.estado

            return (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >

                <td className="px-3 py-2 text-xs text-center">
                  {index + 1}
                </td>

                <td className="px-3 py-2 text-xs text-center">
                  {item.nombre}
                </td>

                <td className="px-3 py-2 text-xs text-center">
                  ${item.valor}
                </td>

                <td className="px-3 py-2 text-xs text-center">
                  {item.fechaCredito}
                </td>

                <td className="px-3 py-2 text-xs text-center">
                  ${item.saldo}
                </td>

                <td className="px-3 py-2 text-center">
                  <StatusBadge status={status} />
                </td>

                <td className="px-3 py-2">
                  <div className="flex justify-center gap-3">

                    {/* Ver detalle */}
                    <Info
                      size={16}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                      onClick={() => onView(item.id)}
                    />

                    {/* Abonar */}
                    {(status === "pendiente" || status === "vencido") && (
                      <DollarSign
                        size={16}
                        className="cursor-pointer text-gray-400 hover:scale-110 transition hover:text-green-600"
                        onClick={() => onAbonar(item.id)}
                      />
                    )}

                    {/* Contactar */}
                    {status === "vencido" && (
                      <Phone
                        size={16}
                        className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-red-500"
                        onClick={() => onContact(item)}
                      />
                    )}

                  </div>
                </td>

              </tr>
            )
          })}
        </tbody>

      </table>
    </div>
  )
}