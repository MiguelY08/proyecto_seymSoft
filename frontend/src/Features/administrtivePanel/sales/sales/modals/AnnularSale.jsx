import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, XCircle, AlertTriangle, Package } from 'lucide-react';
import { useAlert }          from '../../../../shared/alerts/useAlert';
import { useModalAnimation } from '../../../../shared/useModalAnimation';
import { SalesDB }           from '../services/salesBD';
import { formatPrice }       from '../helpers/salesHelpers';
import SaleDetailRow         from '../components/SaleDetailRow';

const MOTIVO_MAX = 500;
const MOTIVO_MIN = 10;

// ─── AnnularSale ──────────────────────────────────────────────────────────────
function AnnularSale() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { showSuccess } = useAlert();

  const sale   = location.state?.sale   ?? null;
  const origin = location.state?.origin ?? null;

  const { visible, handleClose } = useModalAnimation('/admin/sales');

  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  const [motivo,  setMotivo]  = useState('');
  const [touched, setTouched] = useState(false);

  const motivoError = touched && motivo.trim().length < MOTIVO_MIN
    ? `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.`
    : '';

  // ─── Calcular totales ─────────────────────────────────────────────────────
  const items    = sale?.items ?? [];
  const subtotal = items.reduce((acc, i) => acc + i.product.precioDetalle * i.cantidad, 0);
  const iva      = Math.round(subtotal * 0.19);
  const total    = subtotal + iva;

  // ─── Confirmar anulación ──────────────────────────────────────────────────
  const handleConfirm = () => {
    setTouched(true);
    if (motivo.trim().length < MOTIVO_MIN) return;

    SalesDB.anular(sale.id, motivo.trim());
    showSuccess('Venta anulada', `La venta No. ${sale.factura} ha sido anulada exitosamente.`);
    navigate('/admin/sales');
  };

  if (!sale) {
    handleClose();
    return null;
  }

  return (
    <div
      onClick={handleClose}
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin,
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Anular venta</h2>
              <p className="text-red-200 text-xs">Factura No. {sale.factura}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-red-700 leading-relaxed">
            Esta acción es <strong>permanente e irreversible</strong>. La venta quedará anulada,
            el stock de los productos será restaurado y no podrá modificarse el estado posteriormente.
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">

            {/* Columna izquierda: Detalles + Motivo */}
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Detalles de la venta */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Detalles de la venta</p>
                <div className="grid grid-cols-2 gap-x-4">
                  <SaleDetailRow label="Factura No."    value={sale.factura}    />
                  <SaleDetailRow label="Fecha"          value={sale.fecha}      />
                  <SaleDetailRow label="Cliente"        value={sale.cliente}    />
                  <SaleDetailRow label="Vendedor"       value={sale.vendedor}   />
                  <SaleDetailRow label="Método de pago" value={sale.metodoPago} />
                  <SaleDetailRow label="Estado actual"  value={sale.estado}     />
                  <SaleDetailRow label="Entrega"        value={sale.entrega}    />
                  <SaleDetailRow label="Total"          value={sale.total}      />
                </div>
                {sale.entrega === 'Domicilio' && sale.direccion && (
                  <div className="mt-1">
                    <SaleDetailRow label="Dirección" value={sale.direccion} />
                  </div>
                )}
              </div>

              {/* Motivo de anulación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Motivo de anulación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={motivo}
                    onChange={(e) => {
                      if (e.target.value.length <= MOTIVO_MAX) setMotivo(e.target.value);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="Describe el motivo por el cual se anula esta venta..."
                    rows={4}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
                      motivoError
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    }`}
                  />
                  <span className={`absolute bottom-2 right-3 text-[10px] ${
                    motivo.length >= MOTIVO_MAX ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {motivo.length}/{MOTIVO_MAX}
                  </span>
                </div>
                {motivoError && (
                  <p className="mt-1 text-xs text-red-500">{motivoError}</p>
                )}
              </div>
            </div>

            {/* Columna derecha: Productos */}
            <div className="px-6 py-5 flex flex-col">
              <p className="text-sm font-bold text-gray-700 mb-3">Productos del pedido</p>

              {items.length > 0 ? (
                <>
                  {/* Encabezado tabla */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-1.5 border-b-2 border-gray-200 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">V. Unit</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Total</span>
                  </div>

                  {/* Filas de productos */}
                  <div className="flex flex-col divide-y divide-gray-100 mb-4 flex-1">
                    {items.map(({ product, cantidad, descripcion }) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2 items-start"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-gray-700 truncate">{product.nombre}</span>
                            {descripcion && (
                              <span className="text-[10px] text-gray-400 italic leading-tight">{descripcion}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 text-right tabular-nums">{cantidad}</span>
                        <span className="text-xs text-gray-600 text-right tabular-nums">
                          {product.precioDetalle.toLocaleString('es-CO')}
                        </span>
                        <span className="text-xs font-medium text-gray-700 text-right tabular-nums">
                          {(product.precioDetalle * cantidad).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className="mt-auto border-t border-gray-200 pt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-gray-500">Subtotal</span>
                      <span className="text-xs text-gray-700 tabular-nums">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-gray-500">IVA (19%)</span>
                      <span className="text-xs text-gray-700 tabular-nums">{formatPrice(iva)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t-2 border-gray-300">
                      <span className="text-sm font-bold text-gray-800">Total</span>
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{formatPrice(total)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      ↑ Al anular, el stock de estos {items.length} producto{items.length !== 1 ? 's' : ''} será restaurado automáticamente.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
                  <Package className="w-8 h-8 text-gray-200" strokeWidth={1.5} />
                  <p className="text-xs text-gray-400">Sin productos registrados</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" strokeWidth={2} />
            Confirmar anulación
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnularSale;