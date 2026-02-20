import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CreatePagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  purchaseItems,
}) => {
  return (
    <div className="
      flex 
      flex-col 
      sm:flex-row 
      sm:items-center 
      sm:justify-between 
      gap-4 
      mt-6
    ">
      
      {/* Texto */}
      <p className="text-xs text-gray-600 text-center sm:text-left">
        Mostrando {purchaseItems.length} Productos de {purchaseItems.length}
      </p>

      {/* Controles */}
      <div className="
        flex 
        items-center 
        justify-center 
        gap-1.5 
        overflow-x-auto 
        scrollbar-hide
      ">

        {/* Botón anterior */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg border transition-all ${
            currentPage === 1
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números */}
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={i}
              onClick={() => setCurrentPage(pageNum)}
              className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                currentPage === pageNum
                  ? "bg-[#004D77] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Botón siguiente */}
        <button
          onClick={() =>
            setCurrentPage(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg border transition-all ${
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
