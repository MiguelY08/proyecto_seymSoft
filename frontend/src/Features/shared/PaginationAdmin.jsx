import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RECORDS_PER_PAGE = 13;

const PaginationAdmin = ({
  currentPage,
  setCurrentPage,
  totalRecords,
}) => {
  const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-gray-600">
        Mostrando {totalRecords === 0 ? 0 : startIndex + 1} -{" "}
        {Math.min(endIndex, totalRecords)} de {totalRecords} registros
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
          disabled={currentPage === totalPages || totalPages === 0}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
            currentPage === totalPages || totalPages === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
              : "border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationAdmin;

 // const RECORDS_PER_PAGE = 13;
  // const totalPages = Math.ceil(filteredReports.length / RECORDS_PER_PAGE);
  // const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  // const endIndex = startIndex + RECORDS_PER_PAGE;
  // const currentData = filteredReports.slice(startIndex, endIndex);