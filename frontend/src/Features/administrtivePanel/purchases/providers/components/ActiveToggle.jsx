/**
 * Archivo: ActiveToggle.jsx
 * 
 * Este archivo contiene el componente de toggle visual para mostrar y cambiar
 * el estado (activo/inactivo) de un proveedor.
 * 
 * Responsabilidades:
 * - Mostrar visualmente si un proveedor está activo o inactivo
 * - Proporcionar un botón para cambiar el estado
 * - Mostrar indicadores visuales (color verde para activo, rojo para inactivo)
 */

import React from 'react';

/**
 * Componente: ActiveToggle
 * 
 * Toggle estilizado que muestra el estado de un proveedor (Activo/Inactivo)
 * con colores y letras distintivas (A para Activo, I para Inactivo).
 * 
 * Props:
 * @param {boolean} activo - Indica si el proveedor está activo (true) o inactivo (false)
 * @param {Function} onChange - Callback que se ejecuta cuando el usuario hace clic en el toggle
 */
function ActiveToggle({ activo, onChange }) {
  return (
    // Botón principal del toggle con colores dependiendo del estado
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      }`}
      title={activo ? 'Activo' : 'Inactivo'}
    >
      {/* Indicador de texto: 'A' para Activo, 'I' para Inactivo */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {activo ? 'A' : 'I'}
      </span>
      
      {/* Bolita blanca que se desliza de izquierda a derecha */}
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-[23px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

{/* Exporta el componente ActiveToggle como componente por defecto */}
export default ActiveToggle;