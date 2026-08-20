import { Ban, Info, XCircle } from "lucide-react";
import Permission from "../../../configuration/roles/components/Permission";

const StatusBadge = ({ status }) => {
  const isCancelled = status === "Anulado";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
      isCancelled
        ? "border-red-200 bg-red-100 text-red-600"
        : "border-green-300 bg-green-100 text-green-700"
    }`}>
      {status || "Activo"}
    </span>
  );
};

const truncateText = (text, maxLength = 42) => {
  if (!text) return "-";
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
};

export const NonConformingProductsTable = ({
  currentData = [],
  startIndex = 0,
  handleCancel,
  highlightText,
  handleViewDetails,
}) => (
  <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
    <table className="min-w-max w-full table-auto">
      <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
        <tr>
          <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">#</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold">Nombre</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Código de barras</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold">Categoría</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Cantidad afectada</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Fecha de detección</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold">Motivo</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {currentData.length === 0 ? (
          <tr>
            <td colSpan={9} className="py-12 text-center text-sm text-gray-400">No se encontraron reportes.</td>
          </tr>
        ) : currentData.map((report, index) => {
          const isCancelled = report.estado === "Anulado";
          const rowBackground = index % 2 === 0 ? "bg-gray-100" : "bg-white";
          return (
            <tr key={report.id} className={`group transition-colors duration-150 ${rowBackground} hover:bg-blue-50 ${isCancelled ? "opacity-70" : ""}`}>
              <td className={`sticky left-0 z-10 px-3 py-2 text-center font-mono text-xs text-gray-700 whitespace-nowrap transition-colors duration-150 ${rowBackground} group-hover:bg-blue-50`}>
                {highlightText(startIndex + index + 1)}
              </td>
              <td className="max-w-[180px] truncate px-3 py-2 text-center text-xs font-medium text-gray-800 whitespace-nowrap" title={report.nombre || ""}>
                {highlightText(report.nombre)}
              </td>
              <td className="px-3 py-2 text-center font-mono text-xs text-gray-700 whitespace-nowrap">{highlightText(report.codigoBarras)}</td>
              <td className="max-w-[150px] truncate px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">{highlightText(report.categoria)}</td>
              <td className="px-3 py-2 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">{highlightText(report.cantidadAfectada)}</td>
              <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">{highlightText(report.fechaDeteccion)}</td>
              <td className="max-w-[220px] px-3 py-2 text-center text-xs text-gray-700" title={report.motivo || ""}>
                <span className="block truncate">{highlightText(truncateText(report.motivo))}</span>
              </td>
              <td className="px-3 py-2 text-center whitespace-nowrap"><StatusBadge status={report.estado} /></td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                  <Permission permission="producto_no_conforme.ver_informacion">
                    <button onClick={() => handleViewDetails(report)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]" title="Ver información">
                      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                    </button>
                  </Permission>
                  <Permission permission="producto_no_conforme.anular">
                    {isCancelled ? (
                      <span className="cursor-not-allowed text-gray-200" title="Reporte anulado"><Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} /></span>
                    ) : (
                      <button onClick={() => handleCancel(report.id)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-red-500" title="Anular reporte">
                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </Permission>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default NonConformingProductsTable;
