import React from "react";
import { Info, RefreshCw, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const highlightText = (text, search) => {
  if (!search || !text) return text;

  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.toString().split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={index} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export const PurchasesTable = ({
  currentData,
  filteredProducts,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  handleCancel,
  handleViewDetail,
  handleReturn,
  search,
}) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-xs">
            <thead className="bg-[#004D77] text-white">
              <tr>
                <th className="px-3 py-2 text-center font-semibold">#</th>
                <th className="px-3 py-2 text-center font-semibold">No. Facturación</th>
                <th className="px-3 py-2 text-center font-semibold">Fecha compra</th>
                <th className="px-3 py-2 text-center font-semibold">Proveedor</th>
                <th className="px-3 py-2 text-center font-semibold">Cantidad</th>
                <th className="px-3 py-2 text-center font-semibold">Precio</th>
                <th className="px-3 py-2 text-center font-semibold">Estado</th>
                <th className="px-3 py-2 text-center font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {!currentData.length ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                    No se encontraron compras.
                  </td>
                </tr>
              ) : (
                currentData.map((compra, index) => {
                  const recordNumber = startIndex + index + 1;

                  return (
                    <tr
                      key={compra.id}
                      className={`${
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    >
                      {/* # */}
                      <td className="px-3 py-2.5 text-center">
                        {recordNumber}
                      </td>

                      {/* No. Facturación */}
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(compra.numeroFacturacion || "", search)}
                      </td>

                      {/* Fecha */}
                      <td className="px-3 py-2.5 text-center">
                        {compra.fechaCompra}
                      </td>

                      {/* Proveedor */}
                      <td className="px-3 py-2.5">
                        {highlightText(compra.proveedor || "", search)}
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-2.5 text-center">
                        {highlightText(compra.cantidadProductos?.toString() || "", search)}
                      </td>

                      {/* Precio */}
                      <td className="px-3 py-2.5 text-center">
                        ${highlightText(Number(compra.precioTotal).toLocaleString(), search)}
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            compra.estado === "Completada"
                              ? "bg-green-100 text-green-700"
                              : compra.estado === "Anulada"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {highlightText(compra.estado || "Devuelta", search)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleViewDetail(compra)}
                            className="text-gray-400 hover:text-blue-600 transition-all duration-200 transform hover:scale-125"
                            title="Ver detalle"
                          >
                            <Info size={16} />
                          </button>

                          <button
                            onClick={() => {
                              if (compra.estado !== "Anulada") {
                                handleReturn?.(compra);
                              }
                            }}
                            title={
                              compra.estado === "Anulada"
                                ? "No se puede devolver una compra anulada"
                                : "Registrar devolución"
                            }
                            className={`transition-all duration-200 transform hover:scale-125 ${
                              compra.estado === "Anulada"
                                ? "text-gray-200 cursor-not-allowed"
                                : "text-gray-400 hover:text-yellow-600"
                            }`}
                          >
                            <RefreshCw size={16} />
                          </button>

                          <button
                            onClick={() => handleCancel(compra.id)}
                            className="text-gray-400 hover:text-red-600 transition-all duration-200 transform hover:scale-125"
                            title="Anular compra"
                          >
                            <XCircle size={16} />
                          </button>
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

      {/* PAGINADOR */}
      <div className="flex items-center justify-between py-3">
        <p className="text-xs text-gray-600">
          Mostrando {startIndex + 1} –{" "}
          {Math.min(endIndex, filteredProducts.length)} de{" "}
          {filteredProducts.length} registros
        </p>

        <div className="flex items-center gap-1.5 rounded-2xl px-4 py-1.5 shadow">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
              currentPage === 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
                : "border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-[#004D77] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
              currentPage === totalPages
                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
                : "border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PurchasesTable;