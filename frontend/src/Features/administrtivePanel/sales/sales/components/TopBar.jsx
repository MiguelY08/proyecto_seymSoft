import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileSpreadsheet } from 'lucide-react';
import { useAlert }              from '../../../../shared/alerts/useAlert';
import { downloadSalesExcel }    from '../helpers/salesHelpers';
import { SalesDB }               from '../services/salesBD';
import ButtonComponent from '../../../../shared/ButtonComponent';

// ─── TopBar ───────────────────────────────────────────────────────────────────
/**
 * Componente de barra superior para la página de ventas.
 * Incluye buscador, botón de descarga de Excel y botón para nueva venta.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.search - Valor del campo de búsqueda.
 * @param {Function} props.onSearchChange - Función para cambiar el valor de búsqueda.
 */
function TopBar({ search, onSearchChange }) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning } = useAlert();

  const handleDownload = () => {
    const sales = SalesDB.list();

    if (sales.length === 0) {
      showWarning('Sin registros', 'No hay ventas registradas para descargar.');
      return;
    }

    showConfirm(
      'question',
      '¿Desea descargar las ventas?',
      `Se exportarán ${sales.length} registro${sales.length !== 1 ? 's' : ''} en formato Excel.`,
      { confirmButtonText: 'Descargar', cancelButtonText: 'Cancelar' }
    ).then((result) => {
      if (result.isConfirmed) {
        const success = downloadSalesExcel();
        if (success) {
          showTimer('success', 'Descarga completada', 'El archivo Excel se ha generado exitosamente.', 4000);
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
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2 shrink-0">
        {/*Botón Excel*/}
        <ButtonComponent
          className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
          onClick={handleDownload}>
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
        </ButtonComponent>

        <ButtonComponent
          onClick={() => navigate('/admin/sales/form-sale')}
          title="Nueva venta"
        >
          <span className="hidden sm:inline">Nueva venta</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </ButtonComponent>
      </div>

    </div>
  );
}

export default TopBar;