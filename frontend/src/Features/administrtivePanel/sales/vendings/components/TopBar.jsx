import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  ShoppingCart,
  X,
  Eraser,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';
import FormSelect from '../../../../shared/FormSelect';
import { downloadSalesExcel } from '../helpers/salesHelpers';
import Permission from '../../../configuration/roles/components/Permission';

const SALES_TYPE_EXPORT_CONFIG = {
  all: {
    label: 'Todas',
  },
  direct: {
    label: 'Directas',
  },
  web: {
    label: 'Web',
  },
  manual: {
    label: 'Manuales',
  },
};

const SALES_TYPE_OPTIONS = [
  { value: 'all', label: 'Todas', icon: ShoppingCart, iconClassName: 'text-[#004D77]' },
  { value: 'direct', label: 'Directa', icon: ShoppingCart, iconClassName: 'text-green-600' },
  { value: 'web', label: 'Web', icon: ShoppingCart, iconClassName: 'text-blue-600' },
  { value: 'manual', label: 'Manual', icon: ShoppingCart, iconClassName: 'text-amber-600' },
];

function TopBar({
  search,
  onSearchChange,
  activeType = 'all',
  onTypeChange,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
  salesToExport = [],
}) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning, showError } = useAlert();
  const [showSaleTypeMenu, setShowSaleTypeMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(search));
  const searchWrapperRef = useRef(null);
  const hasActiveFilters = Boolean(search || fechaInicial || fechaFinal || activeType !== 'all');

  const handleClearFilters = () => {
    onSearchChange('');
    setFechaInicial('');
    setFechaFinal('');
    onTypeChange('all');
    setCurrentPage(1);
    setIsSearchOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSearchOpen &&
        !search.trim() &&
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, search]);

  const handleNewSale = (vendingType) => {
    setShowSaleTypeMenu(false);
    navigate('/admin/sales/form-sale', { state: { vendingType } });
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const sales = salesToExport;
      const exportConfig = SALES_TYPE_EXPORT_CONFIG[activeType] ?? SALES_TYPE_EXPORT_CONFIG.all;

      if (sales.length === 0) {
        showWarning('Sin registros', `No hay ventas ${exportConfig.label.toLowerCase()} registradas para descargar.`);
        return;
      }

      const result = await showConfirm(
        'question',
        'Desea descargar las ventas?',
        `Se exportaran ${sales.length} registro${sales.length !== 1 ? 's' : ''} de ventas ${exportConfig.label.toLowerCase()} en formato Excel.`,
        { confirmButtonText: 'Descargar', cancelButtonText: 'Cancelar' }
      );

      if (!result.isConfirmed) return;

      const success = await downloadSalesExcel(sales, {
        typeLabel: exportConfig.label,
        activeType,
      });
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
    <div className="flex flex-col gap-3 shrink-0 min-w-0 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 min-w-0 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 lg:flex-1">
        <div
          ref={searchWrapperRef}
          className={`relative w-full transition-all duration-300 ease-out sm:shrink-0 ${
            isSearchOpen ? 'sm:w-64 lg:w-72' : 'sm:w-10'
          }`}
        >
          {isSearchOpen ? (
            <>
              <input
                type="text"
                placeholder="Buscar"
                value={search}
                autoFocus
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004D77] transition"
                title="Cerrar busqueda"
                aria-label="Cerrar busqueda"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:text-[#004D77] hover:border-[#004D77] transition sm:w-10"
              title="Buscar"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="relative w-full transition-all duration-300 sm:w-44 lg:w-40" title="Fecha inicial">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaInicial}
            max={fechaFinal || undefined}
            onChange={(event) => {
              setFechaInicial(event.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-2 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-600 w-full"
            aria-label="Fecha inicial"
          />
        </div>

        <div className="relative w-full transition-all duration-300 sm:w-44 lg:w-40" title="Fecha final">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaFinal}
            min={fechaInicial || undefined}
            onChange={(event) => {
              setFechaFinal(event.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-2 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-600 w-full"
            aria-label="Fecha final"
          />
        </div>

        <div className="w-full min-w-0 transition-all duration-300 sm:w-44">
          <FormSelect
            value={activeType}
            options={SALES_TYPE_OPTIONS}
            onChange={(value) => onTypeChange(value)}
            icon={ShoppingCart}
            placeholder="Tipo"
            ariaLabel="Tipo de venta"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full h-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 cursor-pointer sm:w-10 sm:shrink-0"
            title="Limpiar filtros"
            aria-label="Limpiar filtros"
          >
            <Eraser className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
        <Permission permission="ventas.exportar">
          <ButtonComponent
            className={`flex-1 sm:flex-none bg-white text-green-600 border-green-600 px-3 flex items-center justify-center gap-2 ${
              isExporting
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-green-400'
            }`}
            onClick={isExporting ? undefined : handleDownload}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </ButtonComponent>
        </Permission>

        <Permission permission="ventas.crear">
          <div className="relative flex-1 sm:flex-none">
            <ButtonComponent
              onClick={() => setShowSaleTypeMenu((prev) => !prev)}
              title="Nueva"
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span className="hidden sm:inline">Nueva</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </ButtonComponent>

            {showSaleTypeMenu && (
              <div className="absolute right-0 top-full mt-2 w-full min-w-44 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20">
                <button
                  type="button"
                  onClick={() => handleNewSale('manual')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#004D77]/10 hover:text-[#004D77] cursor-pointer"
                >
                  Venta manual
                </button>
                <button
                  type="button"
                  onClick={() => handleNewSale('direct')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#004D77]/10 hover:text-[#004D77] cursor-pointer"
                >
                  Venta directa
                </button>
              </div>
            )}
          </div>
        </Permission>
      </div>
    </div>
  );
}

export default TopBar;
