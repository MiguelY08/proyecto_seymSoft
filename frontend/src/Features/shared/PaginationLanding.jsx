import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ totalProducts, productsPerPage, currentPage, setCurrentPage }) {
  
  // 🔥 Calcular totalPages dinámicamente
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // 🔥 Si cambian los productos y la página actual ya no existe
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Lógica para mostrar páginas visibles
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  // Productos mostrados en la página actual
  const showing = Math.min(
    productsPerPage,
    totalProducts - (currentPage - 1) * productsPerPage
  );

  if (totalProducts === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 scale-90">

      <p className="text-lg sm:text-xl font-bold text-[#000000]">
        Mostrando{' '}
        <span className="text-[#004D77]">
          {String(showing).padStart(2, '0')}
        </span>{' '}
        Productos de{' '}
        <span className="text-[#004D77]">
          {totalProducts}
        </span>
      </p>

      <div className="flex items-center gap-1 sm:gap-2 bg-white shadow-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4">

        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-[#004D77] hover:bg-[#004D77]/10'
          }`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span
                key={`dots-${index}`}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 text-sm sm:text-base font-medium select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePage(page)}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#004D77] text-white shadow-md'
                    : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-[#004D77] hover:bg-[#004D77]/10'
          }`}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;