// features/categories/components/ActiveToggle.jsx
import { Loader2 } from 'lucide-react';

function ActiveToggle({ activo, onChange, disabled = false, loading = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && !loading && onChange(!activo)}
      disabled={disabled || loading}
      aria-busy={loading}
      title={loading ? 'Procesando...' : (activo ? 'Desactivar categoría' : 'Activar categoría')}
      className={`relative h-5.5 w-11 shrink-0 rounded-full transition-colors duration-300 ${
        activo ? "bg-green-500" : "bg-red-400"
      } ${disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      {loading ? (
        <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />
      ) : (
        <>
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-white transition-all duration-300 ${
              activo ? "left-1" : "right-1"
            }`}
          >
            {activo ? "A" : "I"}
          </span>
          <span
            className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all duration-300 ${
              activo ? "left-[24px]" : "left-0.5"
            }`}
          />
        </>
      )}
    </button>
  );
}

export default ActiveToggle;
