import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSpreadsheet, Plus } from "lucide-react";
import { useAlert } from "../../../shared/alerts/useAlert";
import { downloadUsersExcel } from "../helpers/usersHelpers";
import { usePermissions } from "../../configuration/roles/hooks/usePermissions";
import ButtonComponent from "../../../shared/ButtonComponent";

/**
 * Componente TopBar.
 * Barra superior con buscador, botón de descarga Excel y botón para crear usuario.
 * Maneja búsqueda en tiempo real y exportación de datos.
 * @param {object} props - Props del componente.
 * @param {string} props.search - Valor actual del término de búsqueda.
 * @param {function} props.onSearchChange - Función para actualizar el término de búsqueda.
 * @param {Array} props.users - Array completo de usuarios para exportación.
 * @returns {JSX.Element} Barra con controles de búsqueda y acciones.
 */
function TopBar({ search, onSearchChange, users = [] }) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning } = useAlert();
  const { hasPermission } = usePermissions();

  /**
   * Maneja la descarga de usuarios en formato Excel.
   * Valida que haya usuarios y confirma la acción antes de exportar.
   */
  const handleDownload = () => {
    if (users.length === 0) {
      showWarning(
        "Sin registros",
        "No hay usuarios registrados para descargar.",
      );
      return;
    }

    showConfirm(
      "question",
      "¿Desea descargar los usuarios?",
      `Se exportarán ${users.length} registro${users.length !== 1 ? "s" : ""} en formato Excel.`,
      { confirmButtonText: "Descargar", cancelButtonText: "Cancelar" },
    ).then((result) => {
      if (result.isConfirmed) {
        const success = downloadUsersExcel(users);
        if (success) {
          showTimer(
            "success",
            "Descarga completada",
            "El archivo Excel se ha generado exitosamente.",
            4000,
          );
        }
      }
    });
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
            onClick={handleDownload}>
              <FileSpreadsheet className="w-4 h-4" />
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
