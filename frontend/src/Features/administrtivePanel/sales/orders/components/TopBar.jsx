import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  Eraser,
  FileSpreadsheet,
  Plus,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';
import FormSelect from '../../../../shared/FormSelect';
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
  envioFilter,
  setEnvioFilter,
  hasPendingPaymentReviewFilter = false,
  clearPendingPaymentReviewFilter,
  setCurrentPage,
  orders,
}) {
  const navigate = useNavigate();
  const { showWarning, showSuccess, showError, showConfirm } = useAlert();
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(search));
  const searchWrapperRef = useRef(null);
  const hasActiveFilters = Boolean(
    search || fechaInicial || fechaFinal || origenFilter || pagoEstadoFilter || envioFilter || hasPendingPaymentReviewFilter
  );

  const origenOptions = [
    { value: '', label: 'Todos', icon: Truck, iconClassName: 'text-gray-400' },
    { value: ORIGENES.MANUAL, label: 'Manual', icon: Truck, iconClassName: 'text-[#004D77]' },
    { value: ORIGENES.WEB, label: 'Web', icon: Truck, iconClassName: 'text-[#004D77]' },
  ];
  const pagoOptions = [
    { value: '', label: 'Todos', icon: CreditCard, iconClassName: 'text-gray-400' },
    { value: ESTADOS_PAGO.PENDIENTE, label: 'Pendiente', icon: CreditCard, iconClassName: 'text-amber-500' },
    { value: ESTADOS_PAGO.PAGADO, label: 'Pagado', icon: CreditCard, iconClassName: 'text-green-600' },
  ];
  const envioOptions = [
    { value: '', label: 'Todos', icon: AlertTriangle, iconClassName: 'text-gray-400' },
    { value: 'pendiente', label: 'Pendiente', icon: AlertTriangle, iconClassName: 'text-amber-500' },
    { value: 'completo', label: 'Completo', icon: AlertTriangle, iconClassName: 'text-green-600' },
  ];

  const resetPageAndSet = (setter) => (value) => {
    clearPendingPaymentReviewFilter?.();
    setter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    clearPendingPaymentReviewFilter?.();
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setOrigenFilter('');
    setPagoEstadoFilter('');
    setEnvioFilter('');
    setCurrentPage(1);
    setIsSearchOpen(false);
  };

  const handleDownloadExcel = async () => {
    if (!Array.isArray(orders) || orders.length === 0) {
      showWarning('Sin registros', 'No hay pedidos para exportar.');
      return;
    }

    try {
      const result = await showConfirm(
        'question',
        '¿Exportar pedidos?',
        `Se exportarán ${orders.length} pedido${orders.length !== 1 ? 's' : ''} en formato Excel.`,
        { confirmButtonText: 'Exportar', cancelButtonText: 'Cancelar' },
      );

      if (!result.isConfirmed) return;

      const exported = await exportOrdersToExcel(orders);
      if (exported) {
        showSuccess('Exportación completada', 'El archivo Excel se generó correctamente.');
      }
    } catch (error) {
      showError('Error al exportar', error?.message || 'No se pudo generar el archivo Excel.');
    }
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


  return (
    <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-nowrap lg:items-start lg:gap-3">
        <div
          ref={searchWrapperRef}
          className={`relative w-full transition-all duration-300 ease-out sm:shrink-0 ${
            isSearchOpen ? 'sm:w-64 lg:w-52 xl:w-64 2xl:w-72' : 'sm:w-10'
          }`}
        >
          {isSearchOpen ? (
            <>
              <input
                type="text"
                placeholder="Buscar"
                value={search}
                autoFocus
                onChange={(event) => resetPageAndSet(setSearch)(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
              />
              <button type="button" onClick={() => { setSearch(''); setCurrentPage(1); setIsSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#004D77]" title="Cerrar búsqueda" aria-label="Cerrar búsqueda">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setIsSearchOpen(true)} className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition hover:border-[#004D77] hover:text-[#004D77] sm:w-10" title="Buscar" aria-label="Buscar">
              <Search className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex-1 lg:grid-cols-none lg:flex lg:flex-wrap lg:items-start lg:gap-3">
          <div className="relative w-full sm:min-w-0 sm:flex-1 lg:w-40 lg:flex-none">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
            <input type="date" value={fechaInicial} max={fechaFinal || undefined} aria-label="Fecha inicial" onChange={(event) => resetPageAndSet(setFechaInicial)(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-600 outline-none transition-colors duration-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20" />
          </div>
          <div className="relative w-full sm:min-w-0 sm:flex-1 lg:w-40 lg:flex-none">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
            <input type="date" value={fechaFinal} min={fechaInicial || undefined} aria-label="Fecha final" onChange={(event) => resetPageAndSet(setFechaFinal)(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-600 outline-none transition-colors duration-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20" />
          </div>
          <div className={`w-full sm:min-w-0 sm:flex-1 lg:flex-none ${isSearchOpen ? 'lg:w-16' : 'lg:w-40'}`}>
            <FormSelect value={origenFilter} options={origenOptions} onChange={resetPageAndSet(setOrigenFilter)} placeholder="Origen" ariaLabel="Filtrar por origen" hideSelectedLabel={isSearchOpen} triggerClassName={isSearchOpen ? 'lg:h-10 lg:px-2 lg:pl-2' : ''} minDropdownWidth={192} />
          </div>
          <div className={`w-full sm:min-w-0 sm:flex-1 lg:flex-none ${isSearchOpen ? 'lg:w-16' : 'lg:w-40'}`}>
            <FormSelect value={pagoEstadoFilter} options={pagoOptions} onChange={resetPageAndSet(setPagoEstadoFilter)} placeholder="Pago" ariaLabel="Filtrar por estado de pago" hideSelectedLabel={isSearchOpen} triggerClassName={isSearchOpen ? 'lg:h-10 lg:px-2 lg:pl-2' : ''} minDropdownWidth={192} />
          </div>
          <div className={`w-full sm:col-span-2 sm:min-w-0 lg:flex-none ${isSearchOpen ? 'lg:w-16' : 'lg:w-40'}`}>
            <FormSelect value={envioFilter} options={envioOptions} onChange={resetPageAndSet(setEnvioFilter)} placeholder="Envío" ariaLabel="Filtrar por estado de envío" hideSelectedLabel={isSearchOpen} triggerClassName={isSearchOpen ? 'lg:h-10 lg:px-2 lg:pl-2' : ''} minDropdownWidth={192} />
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={handleClearFilters} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:col-span-2 lg:w-auto" title="Limpiar filtros">
              <Eraser className="h-4 w-4" strokeWidth={2} />
              <span className="lg:hidden">Limpiar filtros</span>
            </button>
          )}
        </div>
        
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0 lg:self-start">
        <Permission permission="pedidos.exportar">
          <ButtonComponent className="flex-1 bg-white px-3 text-green-600 border-green-600 hover:bg-green-400 sm:flex-none" onClick={handleDownloadExcel} title="Exportar Excel">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </ButtonComponent>
        </Permission>
        <Permission permission="pedidos.crear">
          <ButtonComponent onClick={() => navigate('new-order')} title="Nuevo pedido" className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="h-4 w-4" strokeWidth={2} />
          </ButtonComponent>
        </Permission>
      </div>
    </div>
  );
}

export default TopBar;
