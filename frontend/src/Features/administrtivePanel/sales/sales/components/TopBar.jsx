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
import { SalesServices } from '../services/salesServices';

const SALES_TYPE_EXPORT_CONFIG = {
  all: {
    label: 'Todas',
    service: (params) => SalesServices.getAll(params),
  },
  direct: {
    label: 'Directas',
    service: (params) => SalesServices.getDirect(params),
  },
  web: {
    label: 'Web',
    service: (params) => SalesServices.getWeb(params),
  },
  manual: {
    label: 'Manuales',
    service: (params) => SalesServices.getManual(params),
  },
};

const SALES_TYPE_OPTIONS = [
  { value: 'all', label: 'Todas', icon: ShoppingCart, iconClassName: 'text-[#004D77]' },
  { value: 'direct', label: 'Directa', icon: ShoppingCart, iconClassName: 'text-green-600' },
  { value: 'web', label: 'Web', icon: ShoppingCart, iconClassName: 'text-blue-600' },
  { value: 'manual', label: 'Manual', icon: ShoppingCart, iconClassName: 'text-amber-600' },
];

const parseSaleDate = (value) => {
  if (!value) return null;
  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const colombianDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (colombianDate) {
    const [, day, month, year] = colombianDate;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return null;
};

const filterSalesByDate = (sales, fechaInicial, fechaFinal) => {
  if (!fechaInicial && !fechaFinal) return sales;

  return sales.filter((sale) => {
    const saleDate = parseSaleDate(sale.fecha ?? sale.saleDate ?? sale.createdAt);
    if (!saleDate) return false;
    if (fechaInicial && saleDate < fechaInicial) return false;
    if (fechaFinal && saleDate > fechaFinal) return false;
    return true;
  });
};

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

  const loadAllSalesForExport = async () => {
    const config = SALES_TYPE_EXPORT_CONFIG[activeType] ?? SALES_TYPE_EXPORT_CONFIG.all;
    const firstPage = await config.service({ page: 1, limit: 100 });
    const sales = [...(firstPage.sales ?? [])];
    const totalPages = firstPage.pagination?.totalPages ?? 1;

    for (let page = 2; page <= totalPages; page += 1) {
      const response = await config.service({ page, limit: 100 });
      sales.push(...(response.sales ?? []));
    }

    return sales;
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const sales = filterSalesByDate(await loadAllSalesForExport(), fechaInicial, fechaFinal);
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
    <div className="flex items-center justify-between gap-2 sm:gap-3 shrink-0 min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <div
          ref={searchWrapperRef}
          className={`relative shrink-0 transition-all duration-300 ease-out ${
            isSearchOpen ? 'w-64' : 'w-10'
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
                className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
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
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:text-[#004D77] hover:border-[#004D77] transition"
              title="Buscar"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className={`relative shrink-0 transition-all duration-300 ${isSearchOpen ? 'w-28 lg:w-32' : 'w-36 lg:w-40'}`} title="Fecha inicial">
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
            className="pl-9 pr-2 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-600 w-full"
            aria-label="Fecha inicial"
          />
        </div>

        <div className={`relative shrink-0 transition-all duration-300 ${isSearchOpen ? 'w-28 lg:w-32' : 'w-36 lg:w-40'}`} title="Fecha final">
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
            className="pl-9 pr-2 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-600 w-full"
            aria-label="Fecha final"
          />
        </div>

        <div className={`shrink-0 transition-all duration-300 ${isSearchOpen ? 'w-16' : 'w-36'}`}>
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
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 cursor-pointer shrink-0"
            title="Limpiar filtros"
            aria-label="Limpiar filtros"
          >
            <Eraser className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
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
