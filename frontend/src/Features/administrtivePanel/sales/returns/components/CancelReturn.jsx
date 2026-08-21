/**
 * Archivo: CancelReturn.jsx
 * Modal para anular una devolución con motivo registrado.
 */
import React, { useState } from 'react';
import { X, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { cancelReturn } from '../data/returnsService';
import { formatCurrency, formatDate } from '../utils/returnsHelpers';

const MOTIVO_MAX = 255;
const MOTIVO_MIN = 10;

const getCancelReturnError = (error) => {
  const message = error?.response?.data?.message || error?.message || '';

  if (message.toLowerCase().includes('saldo a favor')) {
    return {
      title: 'No se puede revertir el saldo',
      text: message,
    };
  }

  if (message.toLowerCase().includes('stock')) {
    return {
      title: 'No se puede ajustar el stock',
      text: message,
    };
  }

  return {
    title: 'No se pudo anular la devolución',
    text: message || 'Intenta nuevamente.',
  };
};

function DetailItem({ label, value, expandable = true, maxLength = 95 }) {
  const [expanded, setExpanded] = useState(false);
  const text = String(value || '—');
  const canExpand = expandable && text.length > maxLength;
  const visibleText = canExpand && !expanded
    ? `${text.slice(0, maxLength).trim()}...`
    : text;

  return (
    <div className="flex min-w-0 flex-col gap-0.5 [&>span:last-of-type]:hidden">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium leading-relaxed text-gray-800 [overflow-wrap:anywhere]">
        {visibleText}
      </span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-0.5 w-fit text-[11px] font-bold text-[#004D77] transition-colors hover:text-[#003a5c] hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}

function CancelReturn({ isOpen, onClose, returnData = null, onSuccess }) {
  const { showSuccess, showError, showConfirm } = useAlert();
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

  const productos = returnData.details || [];
  const totalGeneral = returnData.totalAmount || 0;

  const handleConfirm = async () => {
    setTouched(true);
    if (validateMotivo(motivo)) return;

    const confirmation = await showConfirm(
      'warning',
      'Confirmar anulación',
      `Vas a anular la devolución ${returnData.returnNumber}. Esta acción es permanente y no podrás modificar sus estados después.`,
      {
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Volver',
      }
    );

    if (!confirmation?.isConfirmed) return;

    try {
      setSubmitting(true);
      const result = await cancelReturn(returnData.id, motivo.trim());
      if (result) {
        showSuccess('Devolución anulada', `La devolución ${returnData.returnNumber} ha sido anulada exitosamente.`);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      const alertData = getCancelReturnError(error);
      showError(alertData.title, alertData.text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div onClick={(e) => e.stopPropagation()} className="flex h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl">
        
        <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-4 py-4 sm:px-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-sky-300/10" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <XCircle className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Anular devolución</h2>
              <p className="text-white/75 text-xs">Devolución No. {returnData.returnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="relative cursor-pointer rounded-full border border-white/10 p-1 text-white transition-colors hover:bg-white/20">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-start gap-3 px-6 py-3 bg-yellow-50 border-b border-yellow-100 shrink-0">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-yellow-800 leading-relaxed">
            Esta acción es <strong>permanente e irreversible</strong>. La devolución quedará anulada
            y no podrá modificarse su estado posteriormente.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">

            <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
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
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
                      motivoError
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
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

            <div className="flex flex-col px-4 py-5 sm:px-6">
              <p className="text-sm font-bold text-gray-700 mb-3">Productos devueltos</p>

              {productos.length > 0 ? (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)_56px_88px_88px] gap-x-3 border-b-2 border-gray-200 pb-1.5 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">V. Unit</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Total</span>
                  </div>

                  <div className="mb-4 flex flex-1 flex-col divide-y divide-gray-100">
                    {productos.map((producto, index) => {
                      // ✅ FALLBACKS
                      const nombre = producto.productName || 'Producto sin nombre';
                      const cantidad = producto.quantity || 1;
                      const precioUnit = producto.unitPrice || 0;
                      const total = cantidad * precioUnit;
                      
                      return (
                        <div
                          key={index}
                          className="grid grid-cols-[minmax(0,1fr)_56px_88px_88px] gap-x-3 py-2 items-start"
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

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
          <button onClick={onClose} className="w-full rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md sm:w-auto">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={Boolean(validateMotivo(motivo)) || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#004D77] bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:border-[#003a5c] hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            ) : (
              <XCircle className="w-4 h-4" strokeWidth={2} />
            )}
            {submitting ? 'Anulando...' : 'Confirmar anulación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelReturn;
