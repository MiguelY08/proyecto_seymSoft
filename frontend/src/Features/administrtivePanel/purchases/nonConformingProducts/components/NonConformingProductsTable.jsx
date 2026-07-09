// features/administrtivePanel/purchases/nonConformingProducts/components/NonConformingProductsTable.jsx
import { Info, XCircle, Ban } from "lucide-react";
import Pagination from "../../../../shared/PaginationAdmin";

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

export const NonConformingProductsTable = ({
  currentData,
  filteredReports,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  handleCancel,
  highlightText,
  handleViewDetails,
}) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead className="bg-[#004D77] text-white">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Código de Barras</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Categoría</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Cantidad Afectada</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Fecha de Detección</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Motivo del Reporte</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((report, index) => {
                const isAnulado = report.estado === "Anulado";
                const rowBg = isAnulado
                  ? "bg-red-50/80 hover:bg-red-100/80"
                  : index % 2 === 0
                    ? "bg-gray-100 hover:bg-blue-50"
                    : "bg-white hover:bg-blue-50";

                return (
                  <tr
                    key={report.id}
                    className={`transition-colors duration-150 ${rowBg}`}
                  >
                    <td className="px-4 py-2.5 text-center text-sm text-gray-800 whitespace-nowrap font-medium">
                      {highlightText(startIndex + index + 1)}
                    </td>

                    <td className="px-4 py-2.5 text-sm text-gray-800 min-w-[180px]">
                      {highlightText(report.nombre)}
                    </td>

                    <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                      {highlightText(report.codigoBarras)}
                    </td>

                    <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                      {highlightText(report.categoria)}
                    </td>

                    <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap font-semibold">
                      {highlightText(report.cantidadAfectada)}
                    </td>

                    <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                      {highlightText(report.fechaDeteccion)}
                    </td>

                    <td className="px-4 py-2.5 text-sm text-gray-700 min-w-[220px] max-w-[320px]">
                      <div className="line-clamp-2">
                        {highlightText(report.motivo)}
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <EstadoBadge estado={report.estado} />
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(report)}
                          title="Ver detalle"
                          className="text-gray-400 hover:text-[#004D77] transition-colors duration-200 cursor-pointer"
                        >
                          <Info className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <button
                          onClick={() => {
                            if (!isAnulado) {
                              handleCancel(report.id);
                            }
                          }}
                          title={isAnulado ? "Reporte anulado" : "Anular reporte"}
                          className={`transition-colors duration-200 ${
                            isAnulado
                              ? "text-red-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-600 cursor-pointer"
                          }`}
                        >
                          {isAnulado ? (
                            <Ban className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <XCircle className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        totalRecords={filteredReports.length}
      />
    </>
  );
};

export default NonConformingProductsTable;
