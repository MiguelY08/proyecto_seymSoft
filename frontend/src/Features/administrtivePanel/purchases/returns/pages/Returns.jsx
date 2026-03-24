import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, AlertTriangle, ChevronLeft } from 'lucide-react';
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

/**
 * Modal para confirmar la anulación de una devolución.
 * Permite al usuario ingresar un motivo de anulación y confirmar la acción.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.devolucion - Objeto de la devolución a anular.
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @param {Function} props.onConfirm - Función para confirmar la anulación con el motivo.
 */
const AnulacionModal = ({ devolucion, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const [error,  setError]  = useState(null);

  /**
   * Maneja la confirmación de anulación, validando el motivo antes de proceder.
   */
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
/**
 * Página principal para gestionar devoluciones.
 * Permite listar, filtrar, crear, editar, ver detalles y anular devoluciones.
 * Incluye integración con compras para crear devoluciones desde compras existentes.
 */
const Returns = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // ── Mapa idCompra → proveedor (debe ir ANTES del filtrado) ─────────────────
  const proveedorMap = React.useMemo(() => {
    const map = {};
    PurchasesDB.list().forEach((c) => {
      map[c.numeroFacturacion] = c.proveedor ?? '—';
    });
    return map;
  }, []);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    const proveedor = (proveedorMap[r.idCompra] ?? '').toLowerCase();
    const coincide =
      r.id?.toLowerCase().includes(q)       ||
      r.idCompra?.toLowerCase().includes(q) ||
      r.estado?.toLowerCase().includes(q)   ||
      proveedor.includes(q)                 ||
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

  // ── Paginación ────────────────────────────────────────────────────────────
  const offset       = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentData  = filtered.slice(offset, offset + RECORDS_PER_PAGE);
  const isSearching  = returns.length > 0 && !!(search || fechaInicial || fechaFinal);

  // ── Handlers ──────────────────────────────────────────────────────────────
  /**
   * Maneja la visualización de detalles de una devolución.
   * @param {Object} devolucion - La devolución a mostrar.
   */
  const handleViewDetail = (devolucion) => {
    setSelectedReturn(devolucion);
    setFormMode(null);
  };

  /**
   * Maneja la edición de una devolución, buscando la compra original.
   * @param {Object} devolucion - La devolución a editar.
   */
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

  /**
   * Inicia el proceso de anulación de una devolución.
   * @param {Object} devolucion - La devolución a anular.
   */
  const handleAnnul = (devolucion) => setAnulando(devolucion);

  /**
   * Confirma la anulación de la devolución con el motivo proporcionado.
   * @param {string} motivo - Motivo de la anulación.
   */
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

  /**
   * Actualiza la lista de devoluciones después de guardar cambios.
   */
  const handleSaved = () => setReturns(ReturnsDB.list());

  /**
   * Cierra el formulario de devolución y resetea estados relacionados.
   */
  const handleCloseForm = () => {
    setFormMode(null);
    setPurchaseForForm(null);
    setSelectedReturn(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* ── Volver ─────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => navigate('/admin/purchases')}
          className="flex items-center gap-1 text-sm font-semibold text-[#004D77]
                     hover:text-[#003a5c] transition-colors duration-200 cursor-pointer group"
        >
          <ChevronLeft
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            strokeWidth={2.5}
          />
          Volver
        </button>
      </div>

      <TopBar
        search={search}
        setSearch={(val) => { setSearch(val); setCurrentPage(1); }}
        fechaInicial={fechaInicial}
        setFechaInicial={setFechaInicial}
        fechaFinal={fechaFinal}
        setFechaFinal={setFechaFinal}
        setCurrentPage={setCurrentPage}
        returns={filtered}
        proveedorMap={proveedorMap}
      />

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <ReturnsTable
          currentData={currentData}
          search={search}
          isSearching={isSearching}
          offset={offset}
          proveedorMap={proveedorMap}
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