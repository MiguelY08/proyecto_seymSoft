import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSpreadsheet, Plus, Loader2, ListFilter, CircleCheck, CircleX } from "lucide-react";
import { useAlert } from "../../../shared/alerts/useAlert";
import { usePermissions } from "../../configuration/roles/hooks/usePermissions";
import ButtonComponent from "../../../shared/ButtonComponent";
import FormSelect from "../../../shared/FormSelect";

function TopBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onExport,
  totalUsers = 0,
}) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning, showError } = useAlert();
  const { hasPermission } = usePermissions();
  const [exporting, setExporting] = useState(false);

  const statusOptions = [
    { value: "", label: "Todos", icon: ListFilter, iconClassName: "text-gray-400" },
    { value: "1", label: "Activos", icon: CircleCheck, iconClassName: "text-green-600" },
    { value: "2", label: "Inactivos", icon: CircleX, iconClassName: "text-red-500" },
  ];

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

  return (
    <div className="flex flex-col gap-3 shrink-0 lg:flex-row lg:items-end lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full pl-4 pr-10 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          strokeWidth={2}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 lg:w-auto">
        <div className="w-full sm:w-48">
          <FormSelect
            value={statusFilter}
            options={statusOptions}
            onChange={onStatusChange}
            icon={ListFilter}
            placeholder="Estado"
            ariaLabel="Estado de usuario"
          />
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {hasPermission("usuarios.exportar") && (
            <ButtonComponent
              className="flex-1 sm:flex-none bg-white text-green-600 border-green-600 hover:bg-green-400 px-3 flex items-center justify-center gap-2"
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
              title="Nuevo"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <span className="hidden sm:inline">Nuevo</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </ButtonComponent>
            )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
