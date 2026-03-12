/**
 * Archivo: ProvidersToolbar.jsx
 * 
 * Este archivo contiene el componente de la barra de herramientas del módulo
 * de Proveedores.
 * 
 * Responsabilidades:
 * - Proporcionar un campo de búsqueda para filtrar proveedores
 * - Mostrar un botón para crear un nuevo proveedor
 * - Capturar el cambio del término de búsqueda y enviar callbacks al componente padre
 */

import React from 'react';
import { Search, Plus } from 'lucide-react';

/**
 * Componente: ProvidersToolbar
 * 
 * Barra de herramientas que contiene el campo de búsqueda y el botón para crear
 * un nuevo proveedor.
 * 
 * Props:
 * @param {string} searchTerm - Término de búsqueda actual
 * @param {Function} onSearchChange - Callback cuando cambia el término de búsqueda
 * @param {Function} onNewClick - Callback cuando se hace clic en "Nuevo proveedor"
 */
function ProvidersToolbar({ searchTerm, onSearchChange, onNewClick }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">

      {/* Campo de búsqueda */}
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
        <input
          type="text"
          placeholder="Buscar por nombre, documento, contacto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
          aria-label="Buscar proveedores"
        />
        {/* Icono de búsqueda */}
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      {/* Botón para crear nuevo proveedor */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onNewClick}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
          aria-label="Nuevo proveedor"
        >
          <span className="hidden sm:inline">Nuevo proveedor</span>
          {/* Icono de agregar (+) */}
          <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

    </div>
  );
}

{/* Exporta el componente ProvidersToolbar como componente por defecto */}
export default ProvidersToolbar;