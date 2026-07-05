import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Eraser,
  FileSpreadsheet,
  Plus,
  Truck,
  CreditCard,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';
import { exportOrdersToExcel } from '../helpers/ordersHelpers';
import { ORIGENES, ESTADOS_PAGO } from '../services/ordersService';
import Permission from '../../../configuration/roles/components/Permission';

function TopBar({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  origenFilter,
  setOrigenFilter,
  pagoEstadoFilter,
  setPagoEstadoFilter,
  setCurrentPage,
  orders,
}) {
  const navigate = useNavigate();
  const { showWarning, showSuccess } = useAlert();
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(search));
  const [openFilter, setOpenFilter] = useState(null);
  const searchWrapperRef = useRef(null);
  const filtersWrapperRef = useRef(null);

  const hayFiltrosActivos = search || fechaInicial || fechaFinal || origenFilter || pagoEstadoFilter;

  const handleClearFilters = () => {
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setOrigenFilter('');
    setPagoEstadoFilter('');
    setCurrentPage(1);
    setIsSearchOpen(false);
    setOpenFilter(null);
  };

  const handleDownloadExcel = async () => {
    if (orders.length === 0) {
      showWarning('Sin registros', 'No hay pedidos que coincidan con los filtros actuales.');
      return;
    }

    const success = await exportOrdersToExcel(orders);
    if (success) {
      showSuccess('Exportación exitosa', 'El archivo Excel se ha descargado correctamente.');
    }
  };

  const handleSelectFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
    setOpenFilter(null);
  };

  const getOptionLabel = (options, value, fallback) => {
    return options.find((option) => option.value === value)?.label || fallback;
  };

  const origenOptions = [
    { value: '', label: 'Todos' },
    { value: ORIGENES.MANUAL, label: 'Manual' },
    { value: ORIGENES.WEB, label: 'Web' },
  ];

  const pagoOptions = [
    { value: '', label: 'Todos' },
    { value: ESTADOS_PAGO.PENDIENTE, label: 'Pendiente' },
    { value: ESTADOS_PAGO.PAGADO, label: 'Pagado' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersWrapperRef.current && !filtersWrapperRef.current.contains(event.target)) {
        setOpenFilter(null);
      }

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

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 shrink-0 min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <div
          ref={searchWrapperRef}
          className={`relative shrink-0 transition-all duration-300 ease-out ${
            isSearchOpen
              ? 'w-64'
              : 'w-10'
          }`}
        >
          {isSearchOpen ? (
            <>
              <input
                type="text"
                placeholder="Buscar"
                value={search}
                autoFocus
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004D77] transition"
                title="Cerrar búsqueda"
                aria-label="Cerrar búsqueda"
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

        <div ref={filtersWrapperRef} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`relative shrink-0 transition-all duration-300 ${
              isSearchOpen ? 'w-16' : 'w-32'
            }`}
          >
          <button
            type="button"
            onClick={() => setOpenFilter((current) => (current === 'origen' ? null : 'origen'))}
            className={`w-full h-10 flex items-center rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:border-[#004D77] focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none transition ${
              isSearchOpen ? 'justify-center gap-1 px-2' : 'justify-between pl-3 pr-2'
            }`}
            title="Origen"
            aria-label="Origen"
          >
            <span className={`flex items-center ${isSearchOpen ? 'gap-1.5' : 'gap-2'} min-w-0`}>
              <Truck className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.8} />
              {!isSearchOpen && (
                <span className="truncate">
                  {origenFilter ? getOptionLabel(origenOptions, origenFilter, 'Origen') : 'Origen'}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
                openFilter === 'origen' ? 'rotate-180' : ''
              }`}
              strokeWidth={2}
            />
          </button>

          {openFilter === 'origen' && (
            <div className="absolute z-20 left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <ul className="py-1">
                {origenOptions.map((option) => {
                  const isSelected = origenFilter === option.value;

                  return (
                    <li key={option.label}>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter(setOrigenFilter, option.value)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#004D77]/10 text-[#004D77] font-medium'
                            : 'text-gray-700 hover:bg-[#004D77]/10'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          </div>

          <div
            className={`relative shrink-0 transition-all duration-300 ${
              isSearchOpen ? 'w-16' : 'w-36'
            }`}
          >
          <button
            type="button"
            onClick={() => setOpenFilter((current) => (current === 'pago' ? null : 'pago'))}
            className={`w-full h-10 flex items-center rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:border-[#004D77] focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none transition ${
              isSearchOpen ? 'justify-center gap-1 px-2' : 'justify-between pl-3 pr-2'
            }`}
            title="Estado de pago"
            aria-label="Estado de pago"
          >
            <span className={`flex items-center ${isSearchOpen ? 'gap-1.5' : 'gap-2'} min-w-0`}>
              <CreditCard className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.8} />
              {!isSearchOpen && (
                <span className="truncate">
                  {pagoEstadoFilter ? getOptionLabel(pagoOptions, pagoEstadoFilter, 'Pago') : 'Pago'}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
                openFilter === 'pago' ? 'rotate-180' : ''
              }`}
              strokeWidth={2}
            />
          </button>

          {openFilter === 'pago' && (
            <div className="absolute z-20 left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <ul className="py-1">
                {pagoOptions.map((option) => {
                  const isSelected = pagoEstadoFilter === option.value;

                  return (
                    <li key={option.label}>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter(setPagoEstadoFilter, option.value)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#004D77]/10 text-[#004D77] font-medium'
                            : 'text-gray-700 hover:bg-[#004D77]/10'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          </div>
        </div>

        {hayFiltrosActivos && (
          <button
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
        <Permission permission="pedidos.exportar">
          <ButtonComponent
            className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
            onClick={handleDownloadExcel}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </ButtonComponent>
        </Permission>

        <Permission permission="pedidos.crear">
          <ButtonComponent
            onClick={() => navigate('new-order')}
            title="Nuevo"
          >
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </ButtonComponent>
        </Permission>
      </div>
    </div>
  );
}

export default TopBar;
