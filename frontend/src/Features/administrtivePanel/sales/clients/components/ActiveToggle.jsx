/**
 * Archivo: ActiveToggle.jsx
 *
 * Componente reutilizable que muestra un botón tipo toggle para indicar si
 * un cliente (u otro elemento) está activo o inactivo.
 *
 * Responsabilidades:
 * - Presentar estado con colores verde/rojo y letras A/I
 * - Disparar callback cuando el usuario hace clic para cambiar estado
 */

/**
 * Componente: ActiveToggle
 *
 * Muestra un switch estilizado que indica si un elemento está activo
 * (color verde, letra A) o inactivo (color rojo, letra I).
 *
 * Props:
 * @param {boolean} activo - Estado actual del elemento
 * @param {Function} onChange - Callback que se ejecuta al hacer clic
 */
function ActiveToggle({ activo, onChange }) {
  return (
    // Botón principal con color dependiendo de 'activo'
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      }`}
      title={activo ? 'Activo' : 'Inactivo'}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {activo ? 'A' : 'I'}
      </span>
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-[23px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default ActiveToggle;