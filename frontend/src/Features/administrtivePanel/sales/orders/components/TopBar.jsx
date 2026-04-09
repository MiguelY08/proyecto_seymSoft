// src/features/orders/components/TopBar.jsx
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Eraser, FileSpreadsheet, Plus } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';
import { exportOrdersToExcel } from '../helpers/ordersHelpers';
import { ORIGENES, ESTADOS_PAGO } from '../services/ordersService';

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

  const hayFiltrosActivos = search || fechaInicial || fechaFinal || origenFilter || pagoEstadoFilter;

  const handleClearFilters = () => {
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setOrigenFilter('');
    setPagoEstadoFilter('');
    setCurrentPage(1);
  };

  const handleDownloadExcel = () => {
    if (orders.length === 0) {
      showWarning('Sin registros', 'No hay pedidos que coincidan con los filtros actuales.');
      return;
    }

    const success = exportOrdersToExcel(orders);
    if (success) {
      showSuccess('Exportación exitosa', 'El archivo Excel se ha descargado correctamente.');
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 shrink-0">
      {/* Buscador */}
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Buscar por número de pedido, cliente, estado..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300
                     focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                     outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
      </div>

      {/* Fecha inicial */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Fecha Inicial</label>
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaInicial}
            max={fechaFinal || undefined}
            onChange={(e) => { setFechaInicial(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300
                       focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                       outline-none bg-white text-gray-600 w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Fecha final */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Fecha Final</label>
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaFinal}
            min={fechaInicial || undefined}
            onChange={(e) => { setFechaFinal(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300
                       focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                       outline-none bg-white text-gray-600 w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Filtro por Origen */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Origen</label>
        <select
          value={origenFilter}
          onChange={(e) => { setOrigenFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300
                     focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                     outline-none bg-white text-gray-600 w-full sm:w-auto"
        >
          <option value="">Todos</option>
          <option value={ORIGENES.MANUAL}>Manual</option>
          <option value={ORIGENES.WEB}>Web</option>
        </select>
      </div>

      {/* Filtro por Estado de Pago */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Pago</label>
        <select
          value={pagoEstadoFilter}
          onChange={(e) => { setPagoEstadoFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300
                     focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                     outline-none bg-white text-gray-600 w-full sm:w-auto"
        >
          <option value="">Todos</option>
          <option value={ESTADOS_PAGO.PENDIENTE}>Pendiente</option>
          <option value={ESTADOS_PAGO.PAGADO}>Pagado</option>
        </select>
      </div>

      {/* Limpiar filtros */}
      {hayFiltrosActivos && (
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500 font-medium pl-0.5 invisible">Limpiar</label>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                       border border-gray-400 rounded-lg text-gray-600 bg-white
                       hover:bg-gray-100 hover:text-gray-800 transition-all duration-200
                       cursor-pointer whitespace-nowrap"
          >
            <Eraser className="w-4 h-4" strokeWidth={2} />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}

      {/* Espaciador flexible */}
      <div className="flex-1" />

      {/* Grupo de botones a la derecha */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Exportar Excel */}
        <ButtonComponent
          className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
          onClick={handleDownloadExcel}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar Excel</span>
        </ButtonComponent>

        {/* Nuevo pedido */}
        <ButtonComponent
          onClick={() => navigate('new-order')}
          title="Nuevo pedido"
        >
          <span className="hidden sm:inline">Nuevo pedido</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </ButtonComponent>
      </div>
    </div>
  );
}

export default TopBar;