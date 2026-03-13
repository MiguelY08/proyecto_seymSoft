import { Info, DollarSign, Phone } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { highlight } from "../utils/paymentHelpers"

export default function PaymentsTable({
  data = [],
  onView,
  onAbonar,
  onContact,
  search = ""
}) {

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value)

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md font-lexend">

      <table className="min-w-max w-full">

        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-1.5 text-xs">#</th>
            <th className="px-3 py-1.5 text-xs text-left">Nombre</th>
            <th className="px-3 py-1.5 text-xs">Crédito Asignado</th>
            <th className="px-3 py-1.5 text-xs">Cupo Ocupado</th>
            <th className="px-3 py-1.5 text-xs">Cupo Disponible</th>
            <th className="px-3 py-1.5 text-xs">Estado</th>
            <th className="px-3 py-1.5 text-xs">Funciones</th>
          </tr>
        </thead>

        <tbody>

          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-400 text-sm">
                No hay registros para mostrar
              </td>
            </tr>
          )}

          {data.map((item, index) => {

            const status          = item.estado
            const cupoOcupado     = item.saldo ?? 0
            const creditoAsignado = item.creditoAsignado ?? 0
            const cupoDisponible  = Math.max(0, creditoAsignado - cupoOcupado)
            const pctOcupado      = creditoAsignado > 0
              ? Math.min(100, Math.round((cupoOcupado / creditoAsignado) * 100))
              : 0

            return (
              <tr
                key={item.id}
                className={`transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50`}
              >

                <td className="px-3 py-1.5 text-xs text-center text-gray-400">
                  {index + 1}
                </td>

                <td className="px-3 py-1.5 text-xs font-medium text-gray-800">
                  {highlight(item.nombre, search)}
                </td>

                <td className="px-3 py-1.5 text-xs text-center text-gray-600 font-medium">
                  {formatCOP(creditoAsignado)}
                </td>

                {/* Cupo Ocupado — monto + barra compacta */}
                <td className="px-3 py-1.5 text-xs text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`font-semibold ${
                      cupoOcupado > 0 ? "text-red-600" : "text-green-600"
                    }`}>
                      {formatCOP(cupoOcupado)}
                    </span>
                    {/* Barra más pequeña y delgada */}
                    <div className="w-12 h-[3px] bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pctOcupado >= 90 ? "bg-red-500" :
                          pctOcupado >= 60 ? "bg-yellow-400" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${pctOcupado}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-[9px] leading-none">
                      {pctOcupado}%
                    </span>
                  </div>
                </td>

                {/* Cupo Disponible */}
                <td className="px-3 py-1.5 text-xs text-center">
                  <span className={`font-semibold ${
                    cupoDisponible > 0 ? "text-green-600" : "text-gray-400"
                  }`}>
                    {formatCOP(cupoDisponible)}
                  </span>
                </td>

                <td className="px-3 py-1.5 text-center">
                  <StatusBadge status={status} search={search} />
                </td>

                <td className="px-3 py-1.5">
                  <div className="flex justify-center gap-3">

                    <Info
                      size={15}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                      title="Ver detalle"
                      onClick={() => onView(item.id)}
                    />

                    {(status === "pendiente" || status === "vencido") && (
                      <DollarSign
                        size={15}
                        className="cursor-pointer text-gray-400 hover:scale-110 transition hover:text-green-600"
                        title="Registrar abono"
                        onClick={() => onAbonar(item.id)}
                      />
                    )}

                    {status === "vencido" && (
                      <Phone
                        size={15}
                        className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-red-500"
                        title="Contactar cliente"
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