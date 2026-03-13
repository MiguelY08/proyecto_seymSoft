/**
 * Archivo: CancelReturn.jsx
 * 
 * Modal para anular una devolución con motivo registrado.
 * Presenta confirmación de la acción que es permanente e irreversible.
 * Permite al usuario ingresar el motivo de anulación y revisar detalles.
 * 
 * Responsabilidades principales:
 * - Mostrar modal de confirmación de anulación
 * - Permitir ingresar motivo de anulación
 * - Validar longitud del motivo (mínimo y máximo de caracteres)
 * - Mostrar detalles de la devolución a anular
 * - Listar productos relevantes
 * - Ejecutar la anulación y mostrar confirmación
 * - Mostrar advertencia sobre irreversibilidad
 */

import React, { useState } from 'react';
import { X, XCircle, AlertTriangle } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { cancelReturn } from '../data/returnsService';
import { formatCurrency, formatDate } from '../utils/returnsHelpers';

// Límite de caracteres para el motivo de anulación
const MOTIVO_MAX = 500;
const MOTIVO_MIN = 10;

// ======================= COMPONENTE AUXILIAR =======================

/**
 * Componente auxiliar para mostrar un campo de detalles.
 * Muestra etiqueta y valor en formato de información.
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.value - Valor a mostrar
 * @returns {JSX.Element} Campo de información formateado
 */
function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  );
}

/**
 * Componente: CancelReturn
 * 
 * Modal temporal para confirmar y ejecutar la anulación de una devolución.
 * Requiere ingresar un motivo antes de proceder.
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar sin anular
 * @param {Object|null} props.returnData - Datos de la devolución a anular
 * @param {Function} props.onSuccess - Callback cuando se anula exitosamente
 * 
 * @returns {JSX.Element|null} Modal si está abierto, null si no
 */
function CancelReturn({ isOpen, onClose, returnData = null, onSuccess }) {
  // Hook para mostrar alertas (confirmación, éxito, error)
  const { showSuccess, showError } = useAlert();

  // Estado para almacenar el motivo de anulación ingresado por el usuario
  const [motivo, setMotivo] = useState('');
  
  // Estado para rastrear si el campo ha sido tocado (validación)
  const [touched, setTouched] = useState(false);

  // Validación: mostrar si el modal debe ser visible
  if (!isOpen || !returnData) return null;

  // ======================= FUNCIONALIDAD: VALIDACIÓN =======================
  
  /**
   * Valida el motivo ingresado.
   * Debe tener entre MOTIVO_MIN y MOTIVO_MAX caracteres.
   */
  const motivoError = touched && motivo.trim().length < MOTIVO_MIN
    ? `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.`
    : '';

  // Obtener productos de la devolución para mostrar
  const productos = returnData.productosDevueltos || [];
  
  // Calcular valor total de la devolución
  const totalGeneral = returnData.totalValor || productos.reduce((a, p) => a + ((p.cantidad || 1) * (p.precioUnit || 0)), 0);

  // ======================= FUNCIONALIDAD: ANULAR =======================
  
  /**
   * Ejecuta la anulación de la devolución.
   * Valida el motivo, ejecuta la operación y muestra confirmación.
   */
  const handleConfirm = () => {
    setTouched(true);
    if (motivo.trim().length < MOTIVO_MIN) return;

    try {
      // Llamar al servicio para anular la devolución
      const cancelled = cancelReturn(returnData.id, motivo.trim());
      if (cancelled) {
        // Mostrar mensaje de éxito
        showSuccess('Devolución anulada', `La devolución ${returnData.numeroDevolucion} ha sido anulada exitosamente.`);
        // Llamar callback de éxito
        onSuccess?.();
        // Cerrar el modal
        onClose();
      }
    } catch (error) {
      // Mostrar error si algo sale mal
      showError('Error', 'No se pudo anular la devolución');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Anular devolución</h2>
              <p className="text-red-200 text-xs">Devolución No. {returnData.numeroDevolucion}</p>
            </div>
          </div>
          {/* Botón para cerrar sin anular */}
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Mensaje de advertencia de irreversibilidad */}
        <div className="flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-red-700 leading-relaxed">
            Esta acción es <strong>permanente e irreversible</strong>. La devolución quedará anulada
            y no podrá modificarse su estado posteriormente.
          </p>
        </div>

        {/* Body del modal con scroll */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">

            {/* Columna izquierda: Detalles generales y campo de motivo */}
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Detalles principales de la devolución */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Detalles de la devolución</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <DetailItem label="Devolución No." value={returnData.numeroDevolucion} />
                  <DetailItem label="Factura No." value={returnData.numeroFactura} />
                  <DetailItem label="Fecha" value={formatDate(returnData.fechaCreacion)} />
                  <DetailItem label="Cliente" value={returnData.cliente} />
                  <DetailItem label="Vendedor" value={returnData.asesor} />
                  <DetailItem label="Estado actual" value={returnData.estado} />
                  <DetailItem label="Total" value={`$${formatCurrency(totalGeneral)}`} />
                </div>
                {returnData.domicilio && returnData.direccion && (
                  <div className="mt-3">
                    <DetailItem label="Dirección" value={returnData.direccion} />
                  </div>
                )}
              </div>

              {/* Campo para ingresar motivo de anulación */}
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
                    placeholder="Describe el motivo por el cual se anula esta devolución..."
                    rows={4}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
                      motivoError
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    }`}
                  />
                  {/* Contador de caracteres */}
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

            {/* Columna derecha: Listado de productos */}
            <div className="px-6 py-5 flex flex-col">
              <p className="text-sm font-bold text-gray-700 mb-3">Productos devueltos</p>

              {productos.length > 0 ? (
                <>
                  {/* Encabezado de tabla de productos */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-1.5 border-b-2 border-gray-200 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">V. Unit</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Total</span>
                  </div>

                  {/* Filas de productos */}
                  <div className="flex flex-col divide-y divide-gray-100 mb-4 flex-1">
                    {productos.map((producto, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2 items-start"
                      >
                        <span className="text-xs text-gray-700 truncate">{producto.nombre}</span>
                        <span className="text-xs text-gray-600 text-right tabular-nums">{producto.cantidad}</span>
                        <span className="text-xs text-gray-600 text-right tabular-nums">
                          ${formatCurrency(producto.precioUnit)}
                        </span>
                        <span className="text-xs font-medium text-gray-700 text-right tabular-nums">
                          ${formatCurrency(producto.cantidad * producto.precioUnit)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Resumen de totales */}
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

        {/* Footer con botones de acción */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          {/* Botón cancelar sin anular */}
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          {/* Botón confirmar anulación */}
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

export default CancelReturn;