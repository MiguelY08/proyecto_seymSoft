import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import { Loader2 } from "lucide-react";

function ActiveToggle({ activo, onChange, disabled = false, loading = false }) {

  const { hasPermission } = usePermissions();

  return hasPermission("productos.activar_desactivar") && (
    <button
      onClick={onChange}
      disabled={disabled || loading}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      } ${disabled || loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading ? (
        <Loader2 className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
      ) : (
        <span
          className={`absolute top-0 h-full flex items-center text-white font-bold text-[9px] transition-all duration-300 ${
            activo ? 'left-1.5' : 'right-1.5'
          }`}
        >
          {activo ? 'A' : 'I'}
        </span>
      )}

      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-[1.4rem]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default ActiveToggle
