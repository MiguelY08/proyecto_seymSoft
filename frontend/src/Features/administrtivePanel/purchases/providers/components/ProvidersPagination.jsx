/**
 * Archivo: ProvidersPagination.jsx
 * 
 * Este archivo contiene el componente de paginación para la tabla de proveedores.
 * 
 * Responsabilidades:
 * - Mostrar controles de navegación entre páginas
 * - Generar números de página con lógica de elipsis (...)
 * - Permitir cambiar a página anterior, siguiente o página específica
 * - Indicar la página actual visualmente
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente: ProvidersPagination
 * 
 * Controles de paginación que permiten navegar entre las páginas de la tabla
 * de proveedores.
 * 
 * Props:
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas disponibles
 * @param {Function} onPageChange - Callback cuando se cambia de página
 */
function ProvidersPagination({ currentPage, totalPages, onPageChange }) {
  // ======== FUNCIONALIDAD: Generar Números de Página ========
  /**
   * Calcula qué números de página mostrar incluyendo '...' (elipsis) cuando
   * hay muchas páginas. Intenta mostrar siempre 5 botones.
   * 
   * Ejemplos:
   * - 5 páginas o menos: [1, 2, 3, 4, 5]
   * - 10 páginas, página 1: [1, 2, 3, ..., 10]
   * - 10 páginas, página 9: [1, ..., 8, 9, 10]
   * - 10 páginas, página 5: [1, ..., 4, 5, 6, ..., 10]
   * 
   * @returns {Array} Array con números y strings '...' para mostrar en los botones
   */
  const getVisiblePages = () => {
    // Si son 5 páginas o menos, muestras todas
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Si estás en las primeras páginas (1, 2, 3)
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    
    // Si estás en las últimas páginas
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Si estás en el medio, muestra página actual con adyacentes
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // No muestra nada si hay una sola página o menos
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {/* Botón: Navegar a página anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Renderiza los botones de página (números y elipsis) */}
      {getVisiblePages().map((page, index) =>
        page === '...' ? (
          // Renderiza elipsis (...) para separar rangos discontinuos
          <span 
            key={`ellipsis-${index}`} 
            className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs"
          >
            ...
          </span>
        ) : (
          // Renderiza botones de número de página
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === page
                ? 'bg-[#004D77] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
            }`}
            aria-label={`Página ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Botón: Navegar a página siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

{/* Exporta el componente ProvidersPagination como componente por defecto */}
export default ProvidersPagination;