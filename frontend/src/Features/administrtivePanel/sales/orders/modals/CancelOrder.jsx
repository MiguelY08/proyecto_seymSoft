import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

/**
 * CancelOrder — Modal para cancelar un pedido con motivo obligatorio.
 * Requiere un motivo de al menos 10 caracteres para proceder.
 * Muestra confirmación y valida el input antes de ejecutar la cancelación.
 *
 * Props:
 *   order     {Object}   - pedido a cancelar
 *   onClose   {Function} - cierra el modal sin cancelar
 *   onConfirm {Function(motivo)} - ejecuta la cancelación con el motivo
 */
function CancelOrder({ order, onClose, onConfirm }) {
  const { showSuccess } = useAlert();
  const [motivo, setMotivo] = useState('');
  const [error,  setError]  = useState(null);

  const MIN_CHARS = 10;
  const MAX_CHARS = 300;

  // ── Validación del motivo ──────────────────────────────────────────────────
  /**
   * Valida el motivo de cancelación.
   * @returns {string|null} Mensaje de error o null si es válido.
   */
  const validate = () => {
    if (!motivo.trim()) return 'El motivo de cancelación es obligatorio.';
    if (motivo.trim().length < MIN_CHARS)
      return `El motivo debe tener al menos ${MIN_CHARS} caracteres.`;
    return null;
  };

  // ── Confirmar cancelación ──────────────────────────────────────────────────
  /**
   * Confirma la cancelación si el motivo es válido.
   * Ejecuta onConfirm con el motivo y muestra éxito.
   */
  const handleConfirmar = () => {
    const err = validate();
    if (err) { setError(err); return; }
    onConfirm(motivo.trim());
    showSuccess(
      'Pedido cancelado',
      `El pedido #${order?.numerosPedido} fue cancelado correctamente.`
    );
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
            <h2 className="text-white font-semibold text-lg">Cancelar pedido</h2>
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
            Estás por cancelar el pedido{' '}
            <span className="font-semibold text-gray-900">#{order?.numerosPedido}</span>.
            Esta acción no se puede deshacer.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={motivo}
              maxLength={MAX_CHARS}
              placeholder={`Describe el motivo de cancelación (mín. ${MIN_CHARS} caracteres)...`}
              onChange={(e) => { setMotivo(e.target.value); setError(null); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg resize-none outline-none
                bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200
                ${error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                }`}
            />
            <div className="flex items-center justify-between">
              {error
                ? <p className="text-xs text-red-500">{error}</p>
                : <span />
              }
              <span className="text-xs text-gray-400 ml-auto">{motivo.length}/{MAX_CHARS}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Volver
          </button>
          <button
            onClick={handleConfirmar}
            className="px-6 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar pedido
          </button>
        </div>

      </div>
    </div>
  );
}

export default CancelOrder;