// src/Features/administrativePanel/sales/returns/components/PurchaseReturnModal.jsx

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/returnsHelpers';
import { useAlert } from '../../../../shared/alerts/useAlert';

const PurchaseReturnModal = ({ 
  isOpen, 
  onClose, 
  productData = null,
  onSuccess 
}) => {
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    quantity: 1,
    reason: 'DEFECTUOSO',
    method: 'Reemplazo',
    observations: ''
  });

  useEffect(() => {
    if (productData && isOpen) {
      setFormData(prev => ({
        ...prev,
        quantity: productData.quantity || 1,
        // Campos pre-llenados desde la compra
        purchaseId: productData.purchaseInfo?.idPurchase,
        purchaseDetailId: productData.purchaseInfo?.idPurchaseDetail,
        providerName: productData.purchaseInfo?.provider?.name_provider || '',
        maxReturnDays: productData.purchaseInfo?.maxReturnDays || 30,
        daysSincePurchase: productData.purchaseInfo?.daysSincePurchase || 0,
        unitPrice: productData.purchaseInfo?.unitPrice || 0,
      }));
    }
  }, [productData, isOpen]);

  if (!isOpen || !productData) return null;

  const { purchaseInfo, saleReturn } = productData;
  const isWithinPeriod = purchaseInfo?.canReturn;
  const validateForm = (data) => {
    const errors = {};
    if (!data.reason) errors.reason = 'Seleccione el motivo de devolución';
    if (!data.method) errors.method = 'Seleccione el método de devolución';
    if (data.reason === 'OTRO' && data.observations.trim().length < 10) {
      errors.observations = 'Describe el motivo Otro con al menos 10 caracteres';
    } else if (data.observations.length > 500) {
      errors.observations = 'Las observaciones no pueden superar 500 caracteres';
    }
    return errors;
  };
  const errors = validateForm(formData);

  const handleSubmit = async () => {
    setTouched({ reason: true, method: true, observations: true });
    if (Object.keys(errors).length > 0 || !isWithinPeriod) return;

    try {
      setLoading(true);
      
      // Llamar a la API para crear devolución de compra
      // (esto depende de cómo tengas implementado el módulo de compras)
      
      showSuccess('Éxito', 'Devolución de compra generada correctamente');
      onSuccess?.();
      onClose();
    } catch (error) {
      showError('Error', error.message || 'Error al generar devolución de compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            Generar devolución de compra
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Estado del plazo */}
          <div className={`p-3 rounded-lg ${isWithinPeriod ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-2">
              {isWithinPeriod ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${isWithinPeriod ? 'text-green-700' : 'text-red-700'}`}>
                  {isWithinPeriod ? '✓ Dentro del plazo de devolución' : '✗ Fuera del plazo de devolución'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Días transcurridos: {purchaseInfo?.daysSincePurchase || 0} / {purchaseInfo?.maxReturnDays || 30} días
                  {purchaseInfo?.provider?.name_provider && ` • Proveedor: ${purchaseInfo.provider.name_provider}`}
                </p>
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">Producto</label>
              <p className="text-sm font-medium text-gray-800">{productData.productName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Código de barras</label>
              <p className="text-sm font-medium text-gray-800">{productData.barcode || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Cantidad disponible</label>
              <p className="text-sm font-medium text-gray-800">{productData.quantity || 0}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Precio unitario</label>
              <p className="text-sm font-medium text-gray-800">${formatCurrency(purchaseInfo?.unitPrice || 0)}</p>
            </div>
          </div>

          {/* Devolución de venta relacionada */}
          <div className="border-t border-gray-200 pt-3">
            <label className="block text-xs font-medium text-gray-500">Devolución de venta relacionada</label>
            <p className="text-sm font-medium text-gray-800">
              {saleReturn?.numeroDevolucion || 'N/A'} 
              <span className="text-xs text-gray-400 ml-2">(Factura: {saleReturn?.numeroFactura || 'N/A'})</span>
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de devolución <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => {
                setTouched((prev) => ({ ...prev, reason: true }));
                setFormData(prev => ({ ...prev, reason: e.target.value }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, reason: true }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#004D77] ${touched.reason && errors.reason ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="DEFECTUOSO">Producto defectuoso</option>
              <option value="PRODUCTO_EQUIVOCADO">Producto equivocado</option>
              <option value="PRODUCTO_INCOMPLETO">Producto incompleto</option>
              <option value="MAL_ESTADO">Producto en mal estado</option>
              <option value="OTRO">Otro</option>
            </select>
            {touched.reason && errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
          </div>

          {/* Método */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de devolución <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.method}
              onChange={(e) => {
                setTouched((prev) => ({ ...prev, method: true }));
                setFormData(prev => ({ ...prev, method: e.target.value }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, method: true }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#004D77] ${touched.method && errors.method ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="Reemplazo">Reemplazo</option>
              <option value="Reembolso">Reembolso</option>
              <option value="Saldo a favor">Saldo a favor</option>
            </select>
            {touched.method && errors.method && <p className="mt-1 text-xs text-red-600">{errors.method}</p>}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => {
                setTouched((prev) => ({ ...prev, observations: true }));
                setFormData(prev => ({ ...prev, observations: e.target.value }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, observations: true }))}
              maxLength={500}
              placeholder="Agrega observaciones adicionales..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#004D77] resize-none ${touched.observations && errors.observations ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="mt-1 flex justify-between gap-2">
              {touched.observations && errors.observations && <p className="text-xs text-red-600">{errors.observations}</p>}
              <span className="ml-auto text-[10px] text-gray-400">{formData.observations.length}/500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!isWithinPeriod || loading || Object.keys(errors).length > 0}
            className={`
              flex-1 py-2.5 text-sm font-bold rounded-xl transition
              ${!isWithinPeriod || loading || Object.keys(errors).length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#004D77] text-white hover:bg-[#003d61]'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Generando...
              </span>
            ) : (
              'Generar devolución de compra'
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-bold rounded-xl transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnModal;
