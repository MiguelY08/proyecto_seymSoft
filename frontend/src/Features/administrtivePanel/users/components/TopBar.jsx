import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSpreadsheet, Plus, Loader2, Circle, CheckCircle2, XCircle } from "lucide-react";
import { useAlert } from "../../../shared/alerts/useAlert";
import { usePermissions } from "../../configuration/roles/hooks/usePermissions";
import ButtonComponent from "../../../shared/ButtonComponent";

/**
 * Componente TopBar.
 * Barra superior con buscador, filtro de estado, botón de descarga Excel y botón para crear usuario.
 * @param {object} props
 * @param {string} props.search - Valor actual del término de búsqueda.
 * @param {function} props.onSearchChange - Función para actualizar la búsqueda.
 * @param {function} props.onExport - Función asíncrona que exporta usuarios (debe manejar la generación y descarga del Excel).
 * @param {number} props.totalUsers - Cantidad total de usuarios (para mostrar en confirmación).
 */
function TopBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onExport,
  totalUsers = 0
}) {
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
      if (typeof onExport !== "function") {
        showError("Error", "La función de exportación no está configurada.");
        return;
      }

      await onExport();
      
      showTimer("success", "Descarga completada", "El archivo Excel se ha generado exitosamente.", 4000);
    } catch (error) {
      console.error("Error al exportar:", error);
      showError("Error", "No se pudo generar el archivo Excel. Intente de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const getStatusOption = (value, label) => {
    const icons = {
      "": <Circle className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />,
      "1": <CheckCircle2 className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />,
      "2": <XCircle className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
    };

    return (
      <div className="flex items-center gap-2">
        {icons[value]}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 shrink-0">
      {/* Grupo izquierdo: Buscador + Filtro de estado */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none">
        {/* Buscador */}
        <div className="relative flex-1 sm:flex-none sm:w-72 md:w-80">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200"
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
        </div>

        {/* Filtro de estado */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="flex-shrink-0 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 transition-colors duration-200 appearance-none cursor-pointer font-medium hover:border-gray-400"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23666' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            paddingRight: '28px'
          }}
        >
          <option value="">
            {/* Todos */}
            ⊙ Todos
          </option>
          <option value="1">
            {/* Activos */}
            ● Activos
          </option>
          <option value="2">
            {/* Inactivos */}
            ○ Inactivos
          </option>
        </select>
      </div>

      {/* Grupo derecho: Botones de acción */}
      <div className="flex items-center gap-2 shrink-0">
        {true && (
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
            <span className="hidden sm:inline">Exportar Excel</span>
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