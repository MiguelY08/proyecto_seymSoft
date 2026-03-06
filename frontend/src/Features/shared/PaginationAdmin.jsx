import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationAdmin = ({
  currentPage,
  onPageChange,
  totalRecords,
  recordsPerPage = 13,
}) => {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex   = Math.min(startIndex + recordsPerPage, totalRecords);

  // ─── Páginas visibles con elipsis ─────────────────────────────────────────
  const getVisiblePages = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);

    if (currentPage <= 4)
      return [1, 2, 3, 4, 5, '...', totalPages];

    if (currentPage >= totalPages - 3)
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-gray-600">
        Mostrando {totalRecords === 0 ? 0 : startIndex + 1} – {endIndex} de {totalRecords} registros
      </p>

      <div className="flex items-center gap-1.5 rounded-2xl px-4 py-1.5 shadow">

        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
            currentPage === 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Páginas */}
        {getVisiblePages().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium ${
                currentPage === page
                  ? 'bg-[#004D77] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
            currentPage === totalPages || totalPages === 0
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default PaginationAdmin;