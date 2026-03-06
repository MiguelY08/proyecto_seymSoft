import React, { useState } from 'react';
import { Info, SquarePen, XCircle, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import FormReturn from './FormReturn';
import DetailReturn from './DetailReturn';
import { useAlert } from '../../../shared/alerts/useAlert';

// ─── Sample Data ────────────────────────────────────────────────────────────────
const sampleData = [
  { id: 1,  devolucion: '23416379-1', noFactura: 'PMPE14988', cliente: 'Fernando Bustamante Ramirez',  productosDev: 1,  total: 9000,   estado: 'Pendiente' },
  { id: 2,  devolucion: '21245379-2', noFactura: 'AMAE52467', cliente: 'Andres Damian Franco Correa',  productosDev: 11, total: 45500,  estado: 'Pendiente' },
  { id: 3,  devolucion: '28459219-1', noFactura: 'GPAG33988', cliente: 'Samuel Perez Perez',           productosDev: 29, total: 133000, estado: 'Pendiente' },
  { id: 4,  devolucion: '21415375-2', noFactura: 'SNKA18905', cliente: 'Shirley Acevedo Botello',      productosDev: 5,  total: 20000,  estado: 'Pendiente' },
  { id: 5,  devolucion: '24321379-1', noFactura: 'KHTE22341', cliente: 'Juan David Zapata Molina',     productosDev: 43, total: 187300, estado: 'Pendiente' },
  { id: 6,  devolucion: '29847201-3', noFactura: 'LRTO44821', cliente: 'Maria Fernanda Lopez Rios',    productosDev: 7,  total: 31500,  estado: 'Aprobada'  },
  { id: 7,  devolucion: '31029847-1', noFactura: 'BVCE55120', cliente: 'Carlos Andres Mejia Garzon',   productosDev: 2,  total: 14000,  estado: 'Anulada'   },
  { id: 8,  devolucion: '18374920-2', noFactura: 'DQNA78302', cliente: 'Paola Restrepo Montoya',       productosDev: 15, total: 68750,  estado: 'Aprobada'  },
  { id: 9,  devolucion: '22019384-1', noFactura: 'FEOZ91043', cliente: 'Andres Felipe Cardona Ruiz',   productosDev: 3,  total: 12000,  estado: 'Pendiente' },
  { id: 10, devolucion: '35019283-4', noFactura: 'HTMK66234', cliente: 'Diana Marcela Vargas Peña',    productosDev: 20, total: 94500,  estado: 'Anulada'   },
  { id: 11, devolucion: '23416379-1', noFactura: 'PMPE14988', cliente: 'Fernando Bustamante Ramirez',  productosDev: 1,  total: 9000,   estado: 'Pendiente' },
  { id: 12, devolucion: '21245379-2', noFactura: 'AMAE52467', cliente: 'Andres Damian Franco Correa',  productosDev: 11, total: 45500,  estado: 'Pendiente' },
  { id: 13, devolucion: '28459219-1', noFactura: 'GPAG33988', cliente: 'Samuel Perez Perez',           productosDev: 29, total: 133000, estado: 'Pendiente' },
  { id: 14, devolucion: '21415375-2', noFactura: 'SNKA18905', cliente: 'Shirley Acevedo Botello',      productosDev: 5,  total: 20000,  estado: 'Pendiente' },
  { id: 15, devolucion: '24321379-1', noFactura: 'KHTE22341', cliente: 'Juan David Zapata Molina',     productosDev: 43, total: 187300, estado: 'Pendiente' },
  { id: 16, devolucion: '29847201-3', noFactura: 'LRTO44821', cliente: 'Maria Fernanda Lopez Rios',    productosDev: 7,  total: 31500,  estado: 'Aprobada'  },
  { id: 17, devolucion: '31029847-1', noFactura: 'BVCE55120', cliente: 'Carlos Andres Mejia Garzon',   productosDev: 2,  total: 14000,  estado: 'Anulada'   },
  { id: 18, devolucion: '18374920-2', noFactura: 'DQNA78302', cliente: 'Paola Restrepo Montoya',       productosDev: 15, total: 68750,  estado: 'Aprobada'  },
  { id: 19, devolucion: '22019384-1', noFactura: 'FEOZ91043', cliente: 'Andres Felipe Cardona Ruiz',   productosDev: 3,  total: 12000,  estado: 'Pendiente' },
  { id: 20, devolucion: '35019283-4', noFactura: 'HTMK66234', cliente: 'Diana Marcela Vargas Peña',    productosDev: 20, total: 94500,  estado: 'Anulada'   },
];

const RECORDS_PER_PAGE = 15;

// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(val);

const estadoStyle = (estado) => {
  switch (estado) {
    case 'Aprobada': return 'text-green-700 bg-green-100';
    case 'Anulada':  return 'text-red-600 bg-red-100';
    default:         return 'text-yellow-700 bg-yellow-100';
  }
};

// ─── Pagination ──────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>
      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={`d-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === page ? 'bg-[#004D77] text-white shadow-sm' : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────────
function Returns({ data: initialData = sampleData, onNew, onEdit, onInfo }) {
  const [data, setData]               = useState(initialData);
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen]       = useState(false);
  const [formData, setFormData]       = useState(null);
  const [detailOpen, setDetailOpen]   = useState(false);
  const [detailData, setDetailData]   = useState(null);

  const { showConfirm, showSuccess } = useAlert();

  const handleNew  = ()    => { setFormData(null); setFormOpen(true); onNew?.(); };
  const handleEdit = (row) => { setFormData(row);  setFormOpen(true); onEdit?.(row); };
  const handleInfo = (row) => { setDetailData(row); setDetailOpen(true); onInfo?.(row); };

  // ── Anular ──
  const handleAnular = async (row) => {
    if (row.estado === 'Anulada') return;
    const result = await showConfirm(
      'error',
      'Anular devolución',
      `¿Estás seguro de que deseas anular la devolución ${row.devolucion}? Esta acción no se puede deshacer.`,
      {
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Cancelar'
      }
    );

    if (result.isConfirmed) {
      setData((prev) => prev.map((r) => r.id === row.id ? { ...r, estado: 'Anulada' } : r));
      showSuccess('Devolución anulada', `La devolución ${row.devolucion} ha sido anulada correctamente`);
    }
  };

  // ── Guardar (crear/editar) ──
  const handleSave = (payload) => {
    // Calcular productosDev (cantidad de productos diferentes devueltos)
    const productosDev = payload.productos?.length || 0;
    
    // Calcular total (suma de cantidad × precioUnit para cada producto)
    const total = payload.productos?.reduce((acc, p) => acc + (p.cantidad * p.precioUnit), 0) || 0;
    
    // Mapear estadoGral a estado para la tabla
    const estado = payload.estadoGral;
    
    if (formData) {
      setData((prev) =>
        prev.map((r) => (r.id === formData.id ? { ...r, ...payload, productosDev, total, estado } : r))
      );
      showSuccess('Devolución actualizada', 'Los datos de la devolución se actualizaron correctamente');
    } else {
      const maxId = data.length > 0 ? Math.max(...data.map((d) => d.id)) : 0;
      const newRow = { id: maxId + 1, ...payload, productosDev, total, estado };
      setData((prev) => [...prev, newRow]);
      showSuccess('Devolución creada', 'La nueva devolución se creó exitosamente');
    }
  };

  // ── Search ──
  const filtered = data.filter((row) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return [
      row.devolucion,
      row.noFactura,
      row.cliente,
      String(row.productosDev),
      String(row.total),
      formatCurrency(row.total),
      row.estado,
    ].some((val) => val?.toLowerCase().includes(q));
  });

  const totalPages      = Math.max(1, Math.ceil(filtered.length / RECORDS_PER_PAGE));
  // Evitar que currentPage quede fuera de rango al filtrar
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex      = (safeCurrentPage - 1) * RECORDS_PER_PAGE;
  const currentData     = filtered.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-2 p-2 sm:p-3">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
        <div className="relative w-full sm:w-72 md:w-96">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
        </div>

        <button
          onClick={() => handleNew()}
          className="flex items-center gap-2 px-2 sm:px-4 py-1.5 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <span className="hidden sm:inline">Nueva devolución</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full min-w-max">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2 text-center text-xs font-semibold">Devolución</th>
              <th className="px-3 py-2 text-center text-xs font-semibold">No.Factura</th>
              <th className="px-3 py-2 text-center text-xs font-semibold">Cliente</th>
              <th className="px-3 py-2 text-center text-xs font-semibold">Productos<br />Devueltos</th>
              <th className="px-3 py-2 text-center text-xs font-semibold">Total</th>
              <th className="px-3 py-2 text-center text-xs font-semibold">Estado</th>
              <th className="px-3 py-2 text-center text-xs font-semibold">Funciones</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr
                key={`${row.id}-${index}`}
                className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
              >
                <td className="px-3 py-1 text-center text-xs text-gray-700 whitespace-nowrap font-medium">{row.id}</td>
                <td className="px-3 py-1 text-center text-xs text-gray-700 whitespace-nowrap">{row.noFactura}</td>
                <td className="px-3 py-1 text-center text-xs text-gray-800 whitespace-nowrap">{row.cliente}</td>
                <td className="px-3 py-1 text-center text-xs text-gray-700">{row.productosDev}</td>
                <td className="px-3 py-1 text-center text-xs text-gray-700 whitespace-nowrap">{formatCurrency(row.total)}</td>
                <td className="px-3 py-1 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${estadoStyle(row.estado)}`}>
                    {row.estado}
                  </span>
                </td>
                <td className="px-3 py-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleInfo(row)}
                      title="Información"
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleEdit(row)}
                      title="Editar"
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                    >
                      <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleAnular(row)}
                      title="Anular"
                      disabled={row.estado === 'Anulada'}
                      className={`transition-colors ${
                        row.estado === 'Anulada'
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-500 cursor-pointer'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  No se encontraron devoluciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">
          Mostrando{' '}
          <span className="text-[#004D77]">{currentData.length}</span>
          {' '}registros de{' '}
          <span className="text-[#004D77]">{filtered.length}</span>
        </p>

        <div className="bg-white shadow-md rounded-xl px-3 py-1.5">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* ── FormReturn modal ── */}
      <FormReturn
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        devolucion={formData}
        onSave={handleSave}
      />

      {/* ── DetailReturn modal ── */}
      <DetailReturn
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        devolucion={detailData}
      />
    </div>
  );
}

export default Returns;
