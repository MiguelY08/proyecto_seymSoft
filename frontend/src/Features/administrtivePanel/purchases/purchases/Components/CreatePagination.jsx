import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CreatePagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  purchaseItems,
}) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-xs text-gray-600">
        Mostrando {purchaseItems.length} Productos de {purchaseItems.length}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
            currentPage === 1
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={i}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                currentPage === pageNum
                  ? "bg-[#004D77] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() =>
            setCurrentPage(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CreatePagination;
