import { Info, DollarSign, Phone } from "lucide-react"
import StatusBadge from "./StatusBadge"

/*
  Tabla principal del index de Pagos y Abonos.
  Muestra un cliente por fila con su resumen de crédito.

  Props:
    data      → array de clientes formateados desde PaymentsPage:
                {
                  id, nombre, documento, telefono,
                  creditoAsignado,   ← límite asignado desde módulo Clientes
                  totalCredito,      ← suma de valorCredito de todas sus facturas
                  totalAbonado,      ← suma de abonos activos de todas sus facturas
                  saldo,             ← saldo pendiente total del cliente
                  estado             ← "al_dia" | "pendiente" | "vencido"
                }
    onView    → (id) => void — navega a vista Ver detalle
    onAbonar  → (id) => void — navega a vista Abonar
    onContact → (item) => void — abre modal Contactar (solo en estado vencido)
*/
export default function PaymentsTable({
  data = [],
  onView,
  onAbonar,
  onContact
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
            <th className="px-3 py-2 text-xs">#</th>
            <th className="px-3 py-2 text-xs text-left">Nombre</th>
            {/* creditoAsignado: límite de crédito que viene del módulo de Clientes */}
            <th className="px-3 py-2 text-xs">Crédito Asignado</th>
            {/* totalCredito: suma de todas las facturas activas del cliente */}
            <th className="px-3 py-2 text-xs">Total Crédito</th>
            {/* saldo: lo que le falta por pagar en total (todas las facturas) */}
            <th className="px-3 py-2 text-xs">Saldo Pendiente</th>
            <th className="px-3 py-2 text-xs">Estado</th>
            <th className="px-3 py-2 text-xs">Funciones</th>
          </tr>
        </thead>

        <tbody>

          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                No hay registros para mostrar
              </td>
            </tr>
          )}

          {data.map((item, index) => {

            const status = item.estado

            return (
              <tr
                key={item.id}
                className={`transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                } hover:bg-gray-50`}
              >

                <td className="px-3 py-2 text-xs text-center text-gray-500">
                  {index + 1}
                </td>

                <td className="px-3 py-2 text-xs font-medium text-gray-800">
                  {item.nombre}
                </td>

                {/* Crédito asignado desde módulo de Clientes */}
                <td className="px-3 py-2 text-xs text-center text-gray-600">
                  {formatCOP(item.creditoAsignado ?? 0)}
                </td>

                {/* Suma de valorCredito de todas las facturas del cliente */}
                <td className="px-3 py-2 text-xs text-center text-gray-600">
                  {formatCOP(item.totalCredito ?? 0)}
                </td>

                {/* Saldo total pendiente — se pinta en rojo si hay deuda */}
                <td className={`px-3 py-2 text-xs text-center font-semibold ${
                  item.saldo > 0 ? "text-red-600" : "text-green-600"
                }`}>
                  {formatCOP(item.saldo ?? 0)}
                </td>

                <td className="px-3 py-2 text-center">
                  <StatusBadge status={status} />
                </td>

                <td className="px-3 py-2">
                  <div className="flex justify-center gap-3">

                    {/* Ver info: siempre disponible */}
                    <Info
                      size={16}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                      title="Ver detalle"
                      onClick={() => onView(item.id)}
                    />

                    {/* Abonar: solo si tiene saldo pendiente */}
                    {(status === "pendiente" || status === "vencido") && (
                      <DollarSign
                        size={16}
                        className="cursor-pointer text-gray-400 hover:scale-110 transition hover:text-green-600"
                        title="Registrar abono"
                        onClick={() => onAbonar(item.id)}
                      />
                    )}

                    {/* Contactar: solo si está vencido */}
                    {status === "vencido" && (
                      <Phone
                        size={16}
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