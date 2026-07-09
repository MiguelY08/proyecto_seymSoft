import { Info, DollarSign, Phone } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { highlight } from "../utils/paymentHelpers";

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
    }).format(value);

  // Highlight que funciona dentro de valores formateados
  const highlightCOP = (value, search) => {
    if (!search) return formatCOP(value);
    const strValue = formatCOP(value);
    const regex = new RegExp(`(${search})`, "gi");
    const parts = strValue.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-blue-200 rounded px-1">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md font-lexend">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-4 py-3 text-center text-sm font-semibold">#</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Crédito Asignado</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Cupo Ocupado</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Cupo Disponible</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
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
            const recordNumber = startIndex + index + 1;

            const status          = item.estado;
            const cupoOcupado     = item.saldo ?? 0;
            const creditoAsignado = item.creditoAsignado ?? 0;
            const cupoDisponible  = item.cupoDisponible ?? 0;
            const pctOcupado      = creditoAsignado > 0
              ? Math.min(100, Math.round((cupoOcupado / creditoAsignado) * 100))
              : 0;

            return (
              <tr
                key={item.id}
                className={`transition-colors duration-150 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-blue-50 cursor-pointer`}
              >
                {/* # */}
                <td className="px-4 py-2.5 text-sm text-center text-gray-700 font-medium">
                  {recordNumber}
                </td>

                {/* Nombre */}
                <td className="px-4 py-2.5 text-sm font-medium text-gray-700">
                  {highlight(item.nombre, search)}
                </td>

                {/* Crédito Asignado */}
                <td className="px-4 py-2.5 text-sm text-center text-gray-700 font-medium">
                  {highlightCOP(creditoAsignado, search)}
                </td>

                {/* Cupo Ocupado */}
                <td className="px-4 py-2.5 text-sm text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`font-semibold ${cupoOcupado > 0 ? "text-red-600" : "text-green-600"}`}>
                      {highlightCOP(cupoOcupado, search)}
                    </span>

                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pctOcupado >= 90 ? "bg-red-500" :
                          pctOcupado >= 60 ? "bg-yellow-400" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${pctOcupado}%` }}
                      />
                    </div>

                    <span className="text-gray-400 text-[11px] leading-none">{pctOcupado}%</span>
                  </div>
                </td>

                {/* Cupo Disponible */}
                <td className="px-4 py-2.5 text-sm text-center">
                  <span className={`font-semibold ${cupoDisponible > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {highlightCOP(cupoDisponible, search)}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-4 py-2.5 text-center">
                  <StatusBadge status={status} search={search} />
                </td>

                {/* Acciones */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-2">
                    <Info
                      size={20}
                      className="text-gray-400 cursor-pointer transition-colors duration-200 hover:text-[#004D77]"
                      title="Ver detalle"
                      onClick={() => onView(item.id)}
                    />
                    {(status === "pendiente" || status === "vencido") && (
                      <DollarSign
                        size={20}
                        className="cursor-pointer text-gray-400 transition-colors duration-200 hover:text-green-600"
                        title="Registrar abono"
                        onClick={() => onAbonar(item.id)}
                      />
                    )}
                    {status === "vencido" && (
                      <Phone
                        size={20}
                        className="text-gray-400 cursor-pointer transition-colors duration-200 hover:text-red-500"
                        title="Contactar cliente"
                        onClick={() => onContact(item)}
                      />
                    )}
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
