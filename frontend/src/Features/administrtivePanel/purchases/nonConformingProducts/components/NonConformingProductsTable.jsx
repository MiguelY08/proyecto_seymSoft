import React from "react";
import { Info, XCircle, Ban } from "lucide-react";
import Pagination from "../../../../shared/PaginationAdmin";

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
}) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-xs">
            <thead className="bg-[#004D77] text-white">
              <tr>
                <th className="px-3 py-2 text-center font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-center font-semibold">
                  Código de Barras
                </th>
                <th className="px-3 py-2 text-center font-semibold">
                  Categoría
                </th>
                <th className="px-3 py-2 text-center font-semibold">
                  Cantidad Afectada
                </th>
                <th className="px-3 py-2 text-center font-semibold">
                  Fecha de Detección
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Motivo del Reporte
                </th>
                <th className="px-3 py-2 text-center font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((report, index) => (
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

                  <td className="px-3 py-2.5">
                    {highlightText(report.nombre)}
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

                  <td className="px-3 py-2.5">
                    {highlightText(report.motivo)}
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <div className="flex justify-center gap-3">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Info size={16} />
                      </button>

                      <button
                        onClick={() => {
                            if (report.estado !== "Anulado") {
                            handleCancel(report.id);
                            }
                        }}
                        className={`transition-colors ${
                            report.estado === "Anulado"
                            ? "text-red-600 cursor-not-allowed"
                            : "text-gray-400 hover:text-red-600"
                        }`}
                        >
                        {report.estado === "Anulado" ? (
                            <Ban size={16} />
                        ) : (
                            <XCircle size={16} />
                        )}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
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