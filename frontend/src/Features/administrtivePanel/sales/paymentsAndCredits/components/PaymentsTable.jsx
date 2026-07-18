import { Info, DollarSign, Phone } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { highlight } from "../utils/paymentHelpers"
import Permission from "../../../configuration/roles/components/Permission"

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
    <div className="font-lexend">
      <div className="grid gap-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-6 text-center text-xs text-gray-400 shadow-sm">
            No hay registros para mostrar
          </div>
        )}

        {data.map((item, index) => {
          const recordNumber = startIndex + index + 1
          const status          = item.estado
          const cupoOcupado     = item.saldo ?? 0
          const creditoAsignado = item.creditoAsignado ?? 0
          const cupoDisponible  = item.cupoDisponible ?? 0
          const pctOcupado      = creditoAsignado > 0
            ? Math.min(100, Math.round((cupoOcupado / creditoAsignado) * 100))
            : 0

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400">
                    #{recordNumber}
                  </p>
                  <h3 className="mt-1 break-words text-sm font-semibold text-[#004D77]">
                    {highlight(item.nombre, search)}
                  </h3>
                </div>

                <StatusBadge status={status} search={search} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Crédito asignado</span>
                  <span className="text-right font-semibold text-gray-700">
                    {highlightCOP(creditoAsignado, search)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Cupo ocupado</span>
                    <span className={`text-right font-semibold ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}>
                      {highlightCOP(cupoOcupado, search)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pctOcupado >= 90 ? "bg-red-500" :
                        pctOcupado >= 60 ? "bg-yellow-400" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${pctOcupado}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-gray-400">
                    {pctOcupado}%
                  </p>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Cupo disponible</span>
                  <span className={`text-right font-semibold ${cupoDisponible > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {highlightCOP(cupoDisponible, search)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 border-t border-gray-100 pt-3">
                <Permission permission="pagos_y_abonos.ver_informacion">
                  <Info
                    size={18}
                    className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                    title="Ver detalle"
                    onClick={() => onView(item.id)}
                  />
                </Permission>
                <Permission permission="pagos_y_abonos.abonar">
                  {(status === "pendiente" || status === "vencido") && (
                    <DollarSign
                      size={18}
                      className="cursor-pointer text-gray-400 hover:scale-110 transition hover:text-green-600"
                      title="Registrar abono"
                      onClick={() => onAbonar(item.id)}
                    />
                  )}
                </Permission>
                <Permission permission="pagos_y_abonos.contactar">
                  {status === "vencido" && (
                    <Phone
                      size={18}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-red-500"
                      title="Contactar cliente"
                      onClick={() => onContact(item)}
                    />
                  )}
                </Permission>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden md:block flex-1 overflow-x-auto rounded-xl shadow-md">
      <table className="min-w-[820px] w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-1 text-[11px]">#</th>
            <th className="px-3 py-1 text-[11px] text-left">Nombre</th>
            <th className="px-3 py-1 text-[11px]">Crédito Asignado</th>
            <th className="px-3 py-1 text-[11px]">Cupo Ocupado</th>
            <th className="px-3 py-1 text-[11px]">Cupo Disponible</th>
            <th className="px-3 py-1 text-[11px]">Estado</th>
            <th className="px-3 py-1 text-[11px]">Acciones</th>
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
            const status          = item.estado
            const cupoOcupado     = item.saldo ?? 0
            const creditoAsignado = item.creditoAsignado ?? 0
            const cupoDisponible  = item.cupoDisponible ?? 0
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
                <td className="px-3 py-1 text-[11px] font-medium text-gray-700 max-w-[220px] break-words">
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
                    <Permission permission="pagos_y_abonos.ver_informacion">
                      <Info
                        size={14}
                        className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                        title="Ver detalle"
                        onClick={() => onView(item.id)}
                      />
                    </Permission>
                    <Permission permission="pagos_y_abonos.abonar">
                      {(status === "pendiente" || status === "vencido") && (
                        <DollarSign
                          size={14}
                          className="cursor-pointer text-gray-400 hover:scale-110 transition hover:text-green-600"
                          title="Registrar abono"
                          onClick={() => onAbonar(item.id)}
                        />
                      )}
                    </Permission>
                    <Permission permission="pagos_y_abonos.contactar">
                      {status === "vencido" && (
                        <Phone
                          size={14}
                          className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-red-500"
                          title="Contactar cliente"
                          onClick={() => onContact(item)}
                        />
                      )}
                    </Permission>
                  </div>
                </td>

              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}
