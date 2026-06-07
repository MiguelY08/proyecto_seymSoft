import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';
import { downloadSalesExcel } from '../helpers/salesHelpers';
import { SalesServices } from '../services/salesServices';

function TopBar({ search, onSearchChange }) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning, showError } = useAlert();
  const [showSaleTypeMenu, setShowSaleTypeMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleNewSale = (vendingType) => {
    setShowSaleTypeMenu(false);
    navigate('/admin/sales/form-sale', { state: { vendingType } });
  };

  const loadAllSalesForExport = async () => {
    const firstPage = await SalesServices.getAll({ page: 1, limit: 100 });
    const sales = [...(firstPage.sales ?? [])];
    const totalPages = firstPage.pagination?.totalPages ?? 1;

    for (let page = 2; page <= totalPages; page += 1) {
      const response = await SalesServices.getAll({ page, limit: 100 });
      sales.push(...(response.sales ?? []));
    }

    return sales;
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const sales = await loadAllSalesForExport();

      if (sales.length === 0) {
        showWarning('Sin registros', 'No hay ventas registradas para descargar.');
        return;
      }

      const result = await showConfirm(
        'question',
        'Desea descargar las ventas?',
        `Se exportaran ${sales.length} registro${sales.length !== 1 ? 's' : ''} en formato Excel.`,
        { confirmButtonText: 'Descargar', cancelButtonText: 'Cancelar' }
      );

      if (!result.isConfirmed) return;

      const success = await downloadSalesExcel(sales);
      if (success) {
        showTimer(
          'success',
          'Descarga completada',
          'El archivo Excel se ha generado exitosamente.',
          4000
        );
      }
    } catch (error) {
      showError(
        'Error al exportar',
        error?.message || 'No se pudo generar el archivo Excel.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
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

      <div className="flex items-center gap-2 shrink-0">
        <ButtonComponent
          className={`bg-white text-green-600 border-green-600 px-2 flex items-center gap-2 ${
            isExporting
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:bg-green-400'
          }`}
          onClick={isExporting ? undefined : handleDownload}
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </ButtonComponent>

        <div className="relative">
          <ButtonComponent
            onClick={() => setShowSaleTypeMenu((prev) => !prev)}
            title="Nueva venta"
          >
            <span className="hidden sm:inline">Nueva venta</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </ButtonComponent>

          {showSaleTypeMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20">
              <button
                type="button"
                onClick={() => handleNewSale('manual')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#004D77]/10 hover:text-[#004D77]"
              >
                Venta manual
              </button>
              <button
                type="button"
                onClick={() => handleNewSale('direct')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#004D77]/10 hover:text-[#004D77]"
              >
                Venta directa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
