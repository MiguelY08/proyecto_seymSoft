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
      <div className="overflow-x-auto rounded-xl shadow-md min-h-0 mb-4">
        <table className="w-full" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "4%" }}  />
            <col style={{ width: "12%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "9%" }}  />
            <col style={{ width: "11%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>

          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">No. Facturación</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Fecha compra</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Proveedor</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Cantidad</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Precio</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Estado</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
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
                const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
                const recordNumber = startIndex + index + 1;

                return (
                  <tr key={compra.id} className={`transition-colors duration-150 ${rowBg}`}>
                    {/* # */}
                    <td className="px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap">
                      {recordNumber}
                    </td>
                    {/* No. Facturación */}
                    <td className="px-3 py-2 text-center text-xs text-gray-700 truncate">
                      {highlightText(compra.numeroFacturacion || "", search)}
                    </td>
                    {/* Fecha */}
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      {compra.fechaCompra}
                    </td>
                    {/* Proveedor */}
                    <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium truncate">
                      {highlightText(compra.proveedor || "", search)}
                    </td>
                    {/* Cantidad */}
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      {highlightText(compra.cantidadProductos?.toString() || "", search)}
                    </td>
                    {/* Precio */}
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      ${highlightText(Number(compra.precioTotal).toLocaleString(), search)}
                    </td>
                    {/* Estado */}
                    <td className="px-3 py-2 text-center text-xs whitespace-nowrap">
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
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewDetail(compra)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Ver detalle"
                        >
                          <Info className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleReturn?.(compra)}
                          disabled={compra.estado === "Anulada"}
                          title={
                            compra.estado === "Anulada"
                              ? "No se puede devolver una compra anulada"
                              : "Registrar devolución"
                          }
                          className={`transition-all duration-200 ${
                            compra.estado === "Anulada"
                              ? "text-gray-200 cursor-not-allowed"
                              : "text-gray-400 hover:scale-110 hover:text-yellow-600 cursor-pointer"
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleCancel(compra.id)}
                          className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                          title="Anular compra"
                        >
                          <XCircle className="w-4 h-4" strokeWidth={1.5} />
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