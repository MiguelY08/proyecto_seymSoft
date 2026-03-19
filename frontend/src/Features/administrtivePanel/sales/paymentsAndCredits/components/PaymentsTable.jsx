import { Info, DollarSign, Phone } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { highlight } from "../utils/paymentHelpers"

export default function PaymentsTable({
  data = [],
  onView,
  onAbonar,
  onContact,
  search = "",
  startIndex = 0, // para numeración correcta con paginación
}) {

  // Formato COP
  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value)

  // Highlight que funciona dentro de valores formateados
  const highlightCOP = (value, search) => {
    if (!search) return formatCOP(value)
    const strValue = formatCOP(value)
    const regex = new RegExp(`(${search})`, "gi")
    const parts = strValue.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-blue-200 rounded px-1">{part}</span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md font-lexend">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-1 text-[11px]">#</th>
            <th className="px-3 py-1 text-[11px] text-left">Nombre</th>
            <th className="px-3 py-1 text-[11px]">Crédito Asignado</th>
            <th className="px-3 py-1 text-[11px]">Cupo Ocupado</th>
            <th className="px-3 py-1 text-[11px]">Cupo Disponible</th>
            <th className="px-3 py-1 text-[11px]">Estado</th>
            <th className="px-3 py-1 text-[11px]">Funciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400 text-[11px]">
                No hay registros para mostrar
              </td>
            </tr>
          )}
          {data.map((item, index) => {
            const recordNumber = startIndex + index + 1
            const rowBg = recordNumber % 2 === 0 ? "bg-gray-200" : "bg-white"

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
                className={`transition ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50 cursor-pointer`} // color de hover suave
              >
                {/* # */}
                <td className="px-3 py-1 text-[11px] text-center text-gray-700 font-medium">
                  {recordNumber}
                </td>

                {/* Nombre */}
                <td className="px-3 py-1 text-[11px] font-medium text-gray-700">
                  {highlight(item.nombre, search)}
                </td>

                {/* Crédito Asignado */}
                <td className="px-3 py-1 text-[11px] text-center text-gray-700 font-medium">
                  {highlightCOP(creditoAsignado, search)}
                </td>

                {/* Cupo Ocupado */}
                <td className="px-3 py-1 text-[11px] text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`font-semibold ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}>
                      {highlightCOP(cupoOcupado, search)}
                    </span>

                    <div className="w-10 h-[2px] bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pctOcupado >= 90 ? "bg-red-500" :
                          pctOcupado >= 60 ? "bg-yellow-400" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${pctOcupado}%` }}
                      />
                    </div>

                    <span className="text-gray-400 text-[9px] leading-none">{pctOcupado}%</span>
                  </div>
                </td>

                {/* Cupo Disponible */}
                <td className="px-3 py-1 text-[11px] text-center">
                  <span className={`font-semibold ${cupoDisponible > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {highlightCOP(cupoDisponible, search)}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-3 py-1 text-center">
                  <StatusBadge status={status} search={search} />
                </td>

                {/* Funciones */}
                <td className="px-3 py-1">
                  <div className="flex justify-center gap-2">
                    <Info
                      size={14}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                      title="Ver detalle"
                      onClick={() => onView(item.id)}
                    />
                    {(status === "pendiente" || status === "vencido") && (
                      <DollarSign
                        size={14}
                        className="cursor-pointer text-gray-400 hover:scale-110 transition hover:text-green-600"
                        title="Registrar abono"
                        onClick={() => onAbonar(item.id)}
                      />
                    )}
                    {status === "vencido" && (
                      <Phone
                        size={14}
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
