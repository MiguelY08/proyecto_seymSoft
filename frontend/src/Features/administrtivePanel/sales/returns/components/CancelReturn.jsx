/**
 * Archivo: CancelReturn.jsx
 * Modal para anular una devolución con motivo registrado.
 */
import React, { useState } from 'react';
import { X, XCircle, AlertTriangle } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { cancelReturn } from '../data/returnsService';
import { formatCurrency, formatDate } from '../utils/returnsHelpers';

const MOTIVO_MAX = 500;
const MOTIVO_MIN = 10;

function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  );
}

function CancelReturn({ isOpen, onClose, returnData = null, onSuccess }) {
  const { showSuccess, showError } = useAlert();
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !returnData) return null;

  const validateMotivo = (value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return 'El motivo de anulación es obligatorio.';
    if (cleanValue.length < MOTIVO_MIN) {
      return `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.`;
    }
    if (value.length > MOTIVO_MAX) {
      return `El motivo no puede superar ${MOTIVO_MAX} caracteres.`;
    }
    return '';
  };
  const motivoError = touched ? validateMotivo(motivo) : '';

  // ✅ Usar details (modelo único)
  const productos = returnData.details || [];
  const totalGeneral = returnData.totalAmount || 0;

  const handleConfirm = async () => {
    setTouched(true);
    if (validateMotivo(motivo)) return;

    try {
      setSubmitting(true);
      const result = await cancelReturn(returnData.id, motivo.trim());
      if (result) {
        showSuccess('Devolución anulada', `La devolución ${returnData.returnNumber} ha sido anulada exitosamente.`);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      showError('Error', error.message || 'No se pudo anular la devolución');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Anular devolución</h2>
              <p className="text-red-200 text-xs">Devolución No. {returnData.returnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-red-700 leading-relaxed">
            Esta acción es <strong>permanente e irreversible</strong>. La devolución quedará anulada
            y no podrá modificarse su estado posteriormente.
          </p>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">

            <div className="px-6 py-5 flex flex-col gap-5">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Detalles de la devolución</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <DetailItem label="Devolución No." value={returnData.returnNumber} />
                  <DetailItem label="Factura No." value={returnData.invoiceNumber} />
                  <DetailItem label="Fecha" value={formatDate(returnData.createdAt)} />
                  <DetailItem label="Cliente" value={returnData.clientName} />
                  <DetailItem label="Vendedor" value={returnData.employeeName} />
                  <DetailItem label="Estado actual" value={returnData.status} />
                  <DetailItem label="Total" value={`$${formatCurrency(totalGeneral)}`} />
                </div>
                {returnData.hasDelivery && returnData.deliveryAddress && (
                  <div className="mt-3">
                    <DetailItem label="Dirección" value={returnData.deliveryAddress} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Motivo de anulación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={motivo}
                    onChange={(e) => {
                      setTouched(true);
                      if (e.target.value.length <= MOTIVO_MAX) setMotivo(e.target.value);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="Describe el motivo por el cual se anula esta devolución..."
                    rows={4}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
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

            <div className="px-6 py-5 flex flex-col">
              <p className="text-sm font-bold text-gray-700 mb-3">Productos devueltos</p>

              {productos.length > 0 ? (
                <>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-1.5 border-b-2 border-gray-200 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">V. Unit</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Total</span>
                  </div>

                  <div className="flex flex-col divide-y divide-gray-100 mb-4 flex-1">
                    {productos.map((producto, index) => {
                      // ✅ FALLBACKS
                      const nombre = producto.productName || 'Producto sin nombre';
                      const cantidad = producto.quantity || 1;
                      const precioUnit = producto.unitPrice || 0;
                      const total = cantidad * precioUnit;
                      
                      return (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2 items-start"
                        >
                          <span className="text-xs text-gray-700 truncate">{nombre}</span>
                          <span className="text-xs text-gray-600 text-right tabular-nums">{cantidad}</span>
                          <span className="text-xs text-gray-600 text-right tabular-nums">
                            ${formatCurrency(precioUnit)}
                          </span>
                          <span className="text-xs font-medium text-gray-700 text-right tabular-nums">
                            ${formatCurrency(total)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto border-t border-gray-200 pt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-gray-500">Total devolución</span>
                      <span className="text-xs font-bold text-gray-900 tabular-nums">${formatCurrency(totalGeneral)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Sin productos registrados</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={Boolean(validateMotivo(motivo)) || submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" strokeWidth={2} />
            {submitting ? 'Anulando...' : 'Confirmar anulación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelReturn;
