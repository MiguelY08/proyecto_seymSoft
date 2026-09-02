import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ totalProducts, productsPerPage, currentPage, setCurrentPage }) {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalProducts);

  useEffect(() => {
    const safePage = Math.min(Math.max(currentPage, 1), totalPages || 1);

    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, setCurrentPage, totalPages]);

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (totalProducts === 0 || totalPages <= 1) return null;

  const previousDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;
  const navigationButtonClass = (disabled) => `flex h-8 w-8 items-center justify-center rounded-lg border ${
    disabled
      ? 'cursor-not-allowed border-slate-200 bg-white text-slate-300'
      : 'cursor-pointer border-slate-300 bg-white text-[#004D77] hover:border-[#004D77]'
  }`;

  return (
    <nav
      className="flex flex-col items-center gap-2 py-5 lg:flex-row lg:justify-between"
      aria-label="Paginación de productos"
    >
      <p className="text-center text-xs text-slate-600 lg:text-left">
        Mostrando {startIndex + 1} – {endIndex} de {totalProducts} productos
      </p>

      <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={previousDisabled}
          aria-label="Página anterior"
          className={navigationButtonClass(previousDisabled)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="whitespace-nowrap text-xs font-medium text-slate-700">
          Página {currentPage} de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={nextDisabled}
          aria-label="Página siguiente"
          className={navigationButtonClass(nextDisabled)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden items-center gap-1.5 rounded-2xl bg-white px-4 py-1.5 shadow-sm lg:flex">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={previousDisabled}
          aria-label="Página anterior"
          className={navigationButtonClass(previousDisabled)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getVisiblePages().map((page, index) =>
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => changePage(page)}
              aria-label={`Ir a la página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${
                currentPage === page
                  ? 'bg-[#004D77] text-white shadow-sm'
                  : 'cursor-pointer border border-slate-300 bg-white text-slate-700 hover:border-[#004D77] hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={nextDisabled}
          aria-label="Página siguiente"
          className={navigationButtonClass(nextDisabled)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
