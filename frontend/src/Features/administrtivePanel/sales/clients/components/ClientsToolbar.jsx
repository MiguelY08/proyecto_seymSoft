import { useState } from 'react';
import { Search, Plus, FileSpreadsheet, Loader2 } from 'lucide-react';
import Permission from '../../../configuration/roles/components/Permission';
import { usePermissions } from '../../../configuration/roles/hooks/usePermissions';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';

function ClientsToolbar({
  searchTerm,
  onSearchChange,
  onNewClick,
  onExport,
  totalClients = 0,
}) {
  const { hasPermission } = usePermissions();
  const { showConfirm, showTimer, showWarning, showError } = useAlert();
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (totalClients === 0) {
      showWarning('Sin registros', 'No hay clientes registrados para descargar.');
      return;
    }

    const confirmed = await showConfirm(
      'question',
      '¿Desea descargar los clientes?',
      `Se exportarán ${totalClients} registro${totalClients !== 1 ? 's' : ''} en formato Excel.`,
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
      console.error('Error al exportar clientes:', error);
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
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          strokeWidth={2}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {false && hasPermission('clientes.exportar') && (
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

        <Permission permission="clientes.crear">
          <ButtonComponent onClick={onNewClick} title="Nuevo">
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </ButtonComponent>
        </Permission>
      </div>
    </div>
  );
}

export default ClientsToolbar;
