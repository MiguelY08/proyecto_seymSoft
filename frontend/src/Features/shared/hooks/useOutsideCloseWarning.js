import { useCallback } from "react";
import { useAlert } from "../alerts/useAlert";

export function useOutsideCloseWarning(onClose, { hasUnsavedChanges = true } = {}) {
  const { showConfirm } = useAlert();

  const handleOutsideClick = useCallback(async (event) => {
    if (event.target !== event.currentTarget) return;

    const result = await showConfirm(
      "warning",
      hasUnsavedChanges ? "¿Salir sin guardar?" : "¿Cerrar esta ventana?",
      hasUnsavedChanges
        ? "Si cierras ahora, los datos o cambios que no hayas guardado se perderán."
        : "Estás a punto de cerrar esta vista. ¿Deseas continuar?",
      {
        confirmButtonText: hasUnsavedChanges ? "Sí, salir" : "Sí, cerrar",
        cancelButtonText: "Continuar aquí",
      }
    );

    if (result?.isConfirmed) onClose();
  }, [hasUnsavedChanges, onClose, showConfirm]);

  return { handleOutsideClick };
}
