/**
 * Archivo: Pagination.jsx
 *
 * Componente de paginación reutilizable usado en la tabla de devoluciones.
 * Permite navegar entre páginas de resultados de forma intuitiva.
 *
 * Responsabilidades:
 * - Mostrar el número de página actual
 * - Renderizar botones para cambiar de página
 * - Mostrar elipsis (...) cuando hay muchas páginas
 * - Manejar navegación anterior/siguiente
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente: Pagination
 *
 * Renderiza controles de paginación para navegar entre páginas.
 *
 * Props:
 * @param {number} currentPage - Página actualmente seleccionada
 * @param {number} totalPages - Total de páginas disponibles
 * @param {Function} onPageChange - Se ejecuta cuando el usuario cambia de página
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  /**
   * Calcula qué números de página deben mostrarse en los botones.
   * Si hay 5 o menos páginas, muestra todas.
   * Si hay más, muestra las páginas con elipsis para economizar espacio.
   * @returns {Array} Array con números de página y elipsis
   */
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

  return (
    <div className="flex items-center gap-1">
      {/* Botón para ir a la página anterior. Está deshabilitado si estamos en la primera página */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>
      
      {/* Botones con números de página o elipsis */}
      {getVisiblePages().map((page, index) => (
        page === '...' ? (
          // Elipsis (...) cuando hay muchas páginas
          <span key={`dots-${index}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">
            ...
          </span>
        ) : (
          // Botón de página numberético. Resalta si es la página actual
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === page
                ? 'bg-[#004D77] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
            }`}
          >
            {page}
          </button>
        )
      ))}
      
      {/* Botón para ir a la siguiente página. Está deshabilitado si estamos en la última página */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default Pagination;