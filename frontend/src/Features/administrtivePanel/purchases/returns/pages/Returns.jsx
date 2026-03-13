import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
import ReturnsDB from '../services/returnsServices';
import { PurchasesDB } from '../../purchases/services/Purchases.service';
import { validateMotivoCancelacion } from '../validators/returnsValidators';
import { useAlert }        from '../../../../shared/alerts/useAlert';
import PaginationAdmin     from '../../../../shared/PaginationAdmin';
import TopBar              from '../components/TopBar';
import ReturnsTable        from '../components/ReturnsTable';
import ReturnForm          from '../modals/ReturnForm';
import ReturnInfo          from '../modals/ReturnInfo';

const RECORDS_PER_PAGE = 13;

// ─── Modal de anulación ───────────────────────────────────────────────────────
const AnulacionModal = ({ devolucion, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const [error,  setError]  = useState(null);

  const handleConfirmar = () => {
    const err = validateMotivoCancelacion(motivo);
    if (err) { setError(err); return; }
    onConfirm(motivo.trim());
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-md flex flex-col"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-700 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white/80" strokeWidth={1.8} />
            <h2 className="text-white font-semibold text-lg">Anular devolución</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            Estás por anular la devolución{' '}
            <span className="font-semibold text-gray-900">{devolucion?.id}</span>.
            Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Motivo de anulación <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={motivo}
              maxLength={300}
              placeholder="Describe el motivo de anulación (mín. 10 caracteres)..."
              onChange={(e) => { setMotivo(e.target.value); setError(null); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg resize-none outline-none
                bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
                ${error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                }`}
            />
            <div className="flex items-center justify-between">
              {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
              <span className="text-xs text-gray-400 ml-auto">{motivo.length}/300</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="px-6 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors cursor-pointer"
          >
            Anular
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const Returns = () => {
  const location = useLocation();
  const { showSuccess, showError, showInfo } = useAlert();

  const [returns,      setReturns]      = useState(() => ReturnsDB.list());
  const [search,       setSearch]       = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal,   setFechaFinal]   = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);

  const [formMode,        setFormMode]        = useState(null);  // 'create' | 'edit' | null
  const [selectedReturn,  setSelectedReturn]  = useState(null);
  const [anulando,        setAnulando]        = useState(null);
  const [purchaseForForm, setPurchaseForForm] = useState(null);

  const alertShownRef = useRef(false);

  // ── Recargar al volver de rutas hijas (igual que Users) ───────────────────
  useEffect(() => {
    setReturns(ReturnsDB.list());
  }, [location.pathname]);

  // ── Abrir ReturnForm desde Purchases (via router state) ───────────────────
  useEffect(() => {
    if (location.state?.openReturnForm && location.state?.purchase) {
      setPurchaseForForm(location.state.purchase);
      setFormMode('create');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    const coincide =
      r.id?.toLowerCase().includes(q)       ||
      r.idCompra?.toLowerCase().includes(q) ||
      r.estado?.toLowerCase().includes(q)   ||
      r.productos?.some((p) =>
        p.nombre?.toLowerCase().includes(q)        ||
        p.motivo?.toLowerCase().includes(q)        ||
        p.tipoDevolucion?.toLowerCase().includes(q)
      );
    const fecha       = new Date(r.fechaDevolucion);
    const desdeValida = fechaInicial ? fecha >= new Date(fechaInicial) : true;
    const hastaValida = fechaFinal   ? fecha <= new Date(fechaFinal)   : true;
    return coincide && desdeValida && hastaValida;
  });

  // ── Alerta sin resultados ─────────────────────────────────────────────────
  useEffect(() => {
    const hayFiltros = search || fechaInicial || fechaFinal;
    if (filtered.length === 0 && hayFiltros && !alertShownRef.current) {
      showInfo('Sin resultados', 'No se encontraron devoluciones con los filtros aplicados.');
      alertShownRef.current = true;
    }
    if (filtered.length > 0) alertShownRef.current = false;
  }, [filtered.length, search, fechaInicial, fechaFinal]);

  useEffect(() => { setCurrentPage(1); }, [search, fechaInicial, fechaFinal]);

  // ── Paginación ────────────────────────────────────────────────────────────
  const offset       = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentData  = filtered.slice(offset, offset + RECORDS_PER_PAGE);
  const isSearching  = returns.length > 0 && !!(search || fechaInicial || fechaFinal);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleViewDetail = (devolucion) => {
    setSelectedReturn(devolucion);
    setFormMode(null);
  };

  const handleEdit = (devolucion) => {
    const compra = PurchasesDB.list().find(
      (p) => p.numeroFacturacion === devolucion.idCompra
    );
    if (!compra) {
      showError('Error', 'No se encontró la compra original de esta devolución.');
      return;
    }
    setPurchaseForForm(compra);
    setSelectedReturn(devolucion);
    setFormMode('edit');
  };

  const handleAnnul = (devolucion) => setAnulando(devolucion);

  const confirmAnnul = (motivo) => {
    try {
      ReturnsDB.annul(anulando.id, motivo);
      setReturns(ReturnsDB.list());
      showSuccess('Devolución anulada', `La devolución ${anulando.id} fue anulada correctamente.`);
    } catch {
      showError('Error', 'No se pudo anular la devolución.');
    } finally {
      setAnulando(null);
    }
  };

  const handleSaved = () => setReturns(ReturnsDB.list());

  const handleCloseForm = () => {
    setFormMode(null);
    setPurchaseForForm(null);
    setSelectedReturn(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      <TopBar
        search={search}
        setSearch={(val) => { setSearch(val); setCurrentPage(1); }}
        fechaInicial={fechaInicial}
        setFechaInicial={setFechaInicial}
        fechaFinal={fechaFinal}
        setFechaFinal={setFechaFinal}
        setCurrentPage={setCurrentPage}
      />

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md">
        <ReturnsTable
          currentData={currentData}
          search={search}
          isSearching={isSearching}
          offset={offset}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onAnnul={handleAnnul}
        />
      </div>

      {/* ── Paginador ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filtered.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Modal — Detalle */}
      {selectedReturn && formMode === null && (
        <ReturnInfo
          devolucion={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Modal — Crear / Editar */}
      {formMode && purchaseForForm && (
        <ReturnForm
          mode={formMode}
          purchase={purchaseForForm}
          devolucion={formMode === 'edit' ? selectedReturn : null}
          onClose={handleCloseForm}
          onSaved={handleSaved}
        />
      )}

      {/* Modal — Anular */}
      {anulando && (
        <AnulacionModal
          devolucion={anulando}
          onClose={() => setAnulando(null)}
          onConfirm={confirmAnnul}
        />
      )}

    </div>
  );
};

export default Returns;