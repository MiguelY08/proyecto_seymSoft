import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSpreadsheet, Plus, Loader2 } from "lucide-react";
import { useAlert } from "../../../shared/alerts/useAlert";
import { usePermissions } from "../../configuration/roles/hooks/usePermissions";
import ButtonComponent from "../../../shared/ButtonComponent";

/**
 * Componente TopBar.
 * Barra superior con buscador, botón de descarga Excel y botón para crear usuario.
 * @param {object} props
 * @param {string} props.search - Valor actual del término de búsqueda.
 * @param {function} props.onSearchChange - Función para actualizar la búsqueda.
 * @param {function} props.onExport - Función asíncrona que exporta usuarios (debe manejar la generación y descarga del Excel).
 * @param {number} props.totalUsers - Cantidad total de usuarios (para mostrar en confirmación).
 */
function TopBar({ search, onSearchChange, onExport, totalUsers = 0 }) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning, showError } = useAlert();
  const { hasPermission } = usePermissions();
  const [exporting, setExporting] = useState(false);

  /**
   * Maneja la descarga de usuarios en formato Excel.
   * Valida que haya usuarios y confirma la acción antes de exportar.
   */
  const handleDownload = async () => {
    if (totalUsers === 0) {
      showWarning("Sin registros", "No hay usuarios registrados para descargar.");
      return;
    }

    const confirmed = await showConfirm(
      "question",
      "¿Desea descargar los usuarios?",
      `Se exportarán ${totalUsers} registro${totalUsers !== 1 ? "s" : ""} en formato Excel.`,
      { confirmButtonText: "Descargar", cancelButtonText: "Cancelar" }
    );

    if (!confirmed?.isConfirmed) return;

    setExporting(true);
    try {
      await onExport(); // La función del padre se encarga de obtener los datos y generar el Excel
      showTimer("success", "Descarga completada", "El archivo Excel se ha generado exitosamente.", 4000);
    } catch (error) {
      console.error("Error al exportar:", error);
      showError("Error", "No se pudo generar el archivo Excel. Intente de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
      {/* Buscador */}
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
      </div>

      {/* Botones de acción: descargar y crear usuario */}
      <div className="flex items-center gap-2 shrink-0">
        {hasPermission("usuarios.descargar") && (
          <ButtonComponent
            className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
            onClick={handleDownload}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Exportar Excel
          </ButtonComponent>
        )}

        {hasPermission("usuarios.crear") && (
          <ButtonComponent
            onClick={() => navigate("/admin/users/form-user")}
            title="Nuevo usuario"
          >
            <span className="hidden sm:inline">Nuevo usuario</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </ButtonComponent>
        )}
      </div>
    </div>
  );
}

export default TopBar;