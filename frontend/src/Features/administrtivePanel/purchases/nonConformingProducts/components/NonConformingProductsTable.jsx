// features/administrtivePanel/purchases/nonConformingProducts/components/NonConformingProductsTable.jsx
import { Info, XCircle, Ban } from "lucide-react";
import Pagination from "../../../../shared/PaginationAdmin";
import Permission from "../../../configuration/roles/components/Permission";

const EstadoBadge = ({ estado }) => {
  const isAnulado = estado === "Anulado";

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        isAnulado
          ? "bg-red-100 text-red-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {estado || "Activo"}
    </span>
  );
};

// Función para truncar texto con límite de caracteres
const truncateText = (text, maxLength = 50) => {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const NonConformingProductsTable = ({
  currentData = [],
  filteredReports = [],
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  handleCancel,
  highlightText,
  handleViewDetails,
}) => {
  const safeData = Array.isArray(currentData) ? currentData : [];
  const safeFiltered = Array.isArray(filteredReports) ? filteredReports : [];

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead className="bg-[#004D77] text-white">
              <tr>
                <th className="px-3 py-2 text-center font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-center font-semibold">Código de Barras</th>
                <th className="px-3 py-2 text-center font-semibold">Categoría</th>
                <th className="px-3 py-2 text-center font-semibold">Cantidad Afectada</th>
                <th className="px-3 py-2 text-center font-semibold">Fecha de Detección</th>
                <th className="px-3 py-2 text-left font-semibold max-w-[200px]">Motivo del Reporte</th>
                <th className="px-3 py-2 text-center font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {safeData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                    No se encontraron reportes.
                  </td>
                </tr>
              ) : (
                safeData.map((report, index) => {
                  const motivoCompleto = report.motivo || "";
                  const motivoTruncado = truncateText(motivoCompleto, 50);

                  return (
                    <tr
                      key={report.id}
                      className={`${
                        report.estado === "Anulado"
                          ? "bg-red-50 opacity-70"
                          : index % 2 === 0
                          ? "bg-white hover:bg-gray-50"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(startIndex + index + 1)}
                      </td>
                      <td className="px-3 py-2.5 max-w-[150px] truncate">
                        <span title={report.nombre || ""}>
                          {highlightText(report.nombre)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(report.codigoBarras)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(report.categoria)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(report.cantidadAfectada)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(report.fechaDeteccion)}
                      </td>
                      <td className="px-3 py-2.5 max-w-[200px]">
                        <span
                          className="block truncate"
                          title={motivoCompleto}
                        >
                          {highlightText(motivoTruncado)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex justify-center gap-3">
                          <Permission permission="producto_no_conforme.ver_informacion">
                            <button
                              onClick={() => handleViewDetails(report)}
                              className="text-gray-400 hover:text-blue-600 transition-all duration-200 transform hover:scale-125"
                              title="Ver detalles completos"
                            >
                              <Info size={16} />
                            </button>
                          </Permission>
                          <Permission permission="producto_no_conforme.anular">
                            <button
                              onClick={() => {
                                if (report.estado !== "Anulado") {
                                  handleCancel(report.id);
                                }
                              }}
                              className={`transition-all duration-200 transform hover:scale-125 ${
                                report.estado === "Anulado"
                                  ? "text-red-600 cursor-not-allowed"
                                  : "text-gray-400 hover:text-red-600"
                              }`}
                            >
                              {report.estado === "Anulado" ? <Ban size={16} /> : <XCircle size={16} />}
                            </button>
                          </Permission>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={safeFiltered.length}
      />
    </>
  );
};

export default NonConformingProductsTable;