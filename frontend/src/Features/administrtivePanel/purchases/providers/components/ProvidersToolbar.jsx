import { useState } from 'react';
import { Search, Plus, FileSpreadsheet, Loader2 } from 'lucide-react';
import { usePermissions } from '../../../configuration/roles/hooks/usePermissions';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';

function ProvidersToolbar({
  searchTerm,
  onSearchChange,
  onNewClick,
  onExport,
  totalProviders = 0,
}) {
  const { hasPermission } = usePermissions();
  const { showConfirm, showTimer, showWarning, showError } = useAlert();
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (totalProviders === 0) {
      showWarning('Sin registros', 'No hay proveedores registrados para descargar.');
      return;
    }

    const confirmed = await showConfirm(
      'question',
      '¿Desea descargar los proveedores?',
      `Se exportarán ${totalProviders} registro${totalProviders !== 1 ? 's' : ''} en formato Excel.`,
      { confirmButtonText: 'Descargar', cancelButtonText: 'Cancelar' }
    );

    if (!confirmed?.isConfirmed) return;

    setExporting(true);
    try {
      if (typeof onExport !== 'function') {
        showError('Error', 'La función de exportación no está configurada.');
        return;
      }

      await onExport();
      showTimer('success', 'Descarga completada', 'El archivo Excel se ha generado exitosamente.', 4000);
    } catch (error) {
      console.error('Error al exportar proveedores:', error);
      showError('Error', 'No se pudo generar el archivo Excel. Intente de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 shrink-0">
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-80">
        <input
          type="text"
          placeholder="Buscar"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200"
          aria-label="Buscar proveedores"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {false && hasPermission('proveedores.exportar') && (
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

        {hasPermission('proveedores.crear') && (
          <ButtonComponent onClick={onNewClick} title="Nuevo">
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </ButtonComponent>
        )}
      </div>
    </div>
  );
}

export default ProvidersToolbar;
