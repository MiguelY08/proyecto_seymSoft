// src/features/orders/components/PaymentsSection.jsx
import React, { useState } from 'react';
import { Plus, DollarSign, Tag, FileText, CheckCircle, CreditCard, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { METODOS_PAGO } from '../services/ordersService';
import FormSelect from '../../../../shared/FormSelect';

/**
 * PaymentsSection — Sección para gestionar pagos de un pedido.
 * Muestra historial de pagos y formulario para agregar nuevo abono.
 *
 * @param {Object} props
 * @param {number|null} props.pedidoId - ID del pedido (null en creación)
 * @param {number} props.total - Total del pedido
 * @param {Array} props.pagos - Lista de pagos existentes
 * @param {Function} props.onAddPayment - Callback al agregar pago exitoso
 * @param {boolean} props.loading - Indica si el formulario está guardando
 * @param {boolean} props.isEditMode - Si es edición (true) o creación (false)
 */
function PaymentsSection({
  pedidoId,
  total,
  pagos = [],
  onAddPayment,
  onRemovePayment,
  loading = false,
  disabled = false,
  isEditMode = false,
  disallowDuplicateMethods = false,
  allowCredit = false,
  creditAvailable = null,
  creditAssigned = null,
}) {
  const [showForm, setShowForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    metodoPago: METODOS_PAGO.EFECTIVO,
    monto: '',
    comprobante: '',
  });
  const [formError, setFormError] = useState('');

  const roundMoney = (value) =>
    Math.round((Number(value) || 0) * 100) / 100;
  const totalPagado = roundMoney(pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0));
  const totalRedondeado = roundMoney(total);
  const saldoPendiente = Math.max(0, roundMoney(totalRedondeado - totalPagado));
  const estaCompletado = totalPagado >= totalRedondeado && totalRedondeado > 0;
  const montoPreview = roundMoney(newPayment.monto);
  const creditLimit = creditAvailable === null || creditAvailable === undefined
    ? null
    : roundMoney(creditAvailable);
  const isCreditPayment = newPayment.metodoPago === METODOS_PAGO.CREDITO;
  const paymentMethodOptions = [
    { value: METODOS_PAGO.EFECTIVO, label: 'Efectivo' },
    { value: METODOS_PAGO.TRANSFERENCIA, label: 'Transferencia' },
  ];
  const availablePaymentMethodOptions = allowCredit
    ? [...paymentMethodOptions, { value: METODOS_PAGO.CREDITO, label: 'Crédito' }]
    : paymentMethodOptions;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const cleanMoneyInput = (value) => String(value || '').replace(/\D/g, '');

  const parseMoneyInput = (value) => roundMoney(Number(cleanMoneyInput(value)));

  const formatMoneyInput = (value) => {
    const cleanValue = cleanMoneyInput(value);
    if (!cleanValue) return '';

    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0,
    }).format(Number(cleanValue));
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? isoString : date.toLocaleDateString('es-CO');
  };

  const handleMontoChange = (e) => {
    const value = cleanMoneyInput(e.target.value);
    const amount = parseMoneyInput(value);
    setNewPayment(prev => ({ ...prev, monto: value }));
    if (amount > saldoPendiente) {
      setFormError(`El monto excede el saldo pendiente (${formatCurrency(saldoPendiente)}).`);
      return;
    }
    if (isCreditPayment && creditLimit !== null && amount > creditLimit) {
      setFormError(`El monto supera el cupo disponible (${formatCurrency(creditLimit)}).`);
      return;
    }
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const monto = parseMoneyInput(newPayment.monto);

    if (monto <= 0) {
      setFormError('El monto debe ser un número mayor a cero.');
      return;
    }
    if (Math.round(monto * 100) > Math.round(saldoPendiente * 100)) {
      setFormError(`El monto excede el saldo pendiente (${formatCurrency(saldoPendiente)}).`);
      return;
    }
    if (!allowCredit && newPayment.metodoPago === METODOS_PAGO.CREDITO) {
      setFormError('El pago por credito no esta disponible para pedidos.');
      return;
    }
    if (newPayment.metodoPago === METODOS_PAGO.CREDITO && creditLimit !== null && monto > creditLimit) {
      setFormError(`El monto supera el cupo disponible (${formatCurrency(creditLimit)}).`);
      return;
    }
    if (
      disallowDuplicateMethods &&
      pagos.some((pago) => pago.metodoPago === newPayment.metodoPago)
    ) {
      setFormError('No se puede repetir un metodo de pago en la misma venta.');
      return;
    }

    onAddPayment({
      metodoPago: newPayment.metodoPago,
      monto,
      comprobante: newPayment.comprobante.trim() || null,
    });

    // Resetear formulario
    setNewPayment({
      metodoPago: METODOS_PAGO.EFECTIVO,
      monto: '',
      comprobante: '',
    });
    setShowForm(false);
  };

  const canRemovePayment = (pago) =>
    Boolean(onRemovePayment) &&
    !loading &&
    !disabled &&
    !pago.locked &&
    !pago.isLocked &&
    !pago.persisted;

  // Clases unificadas
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputBaseClass = "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 focus:ring-2 focus:ring-[#004D77]/20 focus:border-[#004D77]";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header de sección estilo ventas */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Pagos y Abonos</p>
            <p className="text-xs text-gray-400">Gestión de pagos del pedido</p>
          </div>
        </div>
        {!estaCompletado && !disabled && (
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={loading || disabled}
            className="text-sm text-[#004D77] hover:bg-[#004D77]/10 transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-md"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            Agregar abono
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Resumen de montos */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Total del pedido</p>
            <p className="text-lg font-semibold">{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total pagado</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPagado)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo pendiente</p>
            <p className={`text-lg font-semibold ${saldoPendiente > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {formatCurrency(saldoPendiente)}
            </p>
          </div>
        </div>

        {/* Formulario para agregar pago */}
        {showForm && !estaCompletado && !disabled && (
          <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium mb-3">Nuevo abono</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Método de pago */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Método</label>
                <FormSelect
                  value={newPayment.metodoPago}
                  options={availablePaymentMethodOptions}
                  onChange={(value) => {
                    setNewPayment(prev => ({ ...prev, metodoPago: value }));
                    if (
                      value === METODOS_PAGO.CREDITO &&
                      creditLimit !== null &&
                      montoPreview > creditLimit
                    ) {
                      setFormError(`El monto supera el cupo disponible (${formatCurrency(creditLimit)}).`);
                      return;
                    }
                    setFormError('');
                  }}
                  icon={CreditCard}
                  disabled={loading || disabled}
                  placeholder="Método"
                  ariaLabel="Método de pago"
                />
              </div>

              {/* Monto */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Monto</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatMoneyInput(newPayment.monto)}
                    onChange={handleMontoChange}
                    placeholder="0"
                    className={inputBaseClass}
                    disabled={loading || disabled}
                  />
                </div>
                {isCreditPayment && (
                  <div className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                    creditLimit !== null && montoPreview > creditLimit
                      ? 'border-red-200 bg-red-50'
                      : 'border-emerald-200 bg-emerald-50'
                  }`}>
                    <CreditCard
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        creditLimit !== null && montoPreview > creditLimit
                          ? 'text-red-700'
                          : 'text-emerald-700'
                      }`}
                      strokeWidth={1.8}
                    />
                    <p className={`text-sm font-medium ${
                      creditLimit !== null && montoPreview > creditLimit
                        ? 'text-red-800'
                        : 'text-emerald-800'
                    }`}>
                      Cupo disponible: {creditLimit !== null ? formatCurrency(creditLimit) : 'No disponible'}
                      {creditAssigned !== null && creditAssigned !== undefined
                        ? ` / asignado: ${formatCurrency(creditAssigned)}`
                        : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Comprobante */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Comprobante (opcional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                  <input
                    type="text"
                    value={newPayment.comprobante}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, comprobante: e.target.value }))}
                    placeholder="N° referencia"
                    className={inputBaseClass}
                    disabled={loading || disabled}
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" strokeWidth={1.8} />
                <p className="text-sm font-medium text-red-800">{formError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                disabled={loading || disabled}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || disabled || Boolean(formError)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Agregar abono'}
              </button>
            </div>
          </form>
        )}

        {/* Historial de pagos */}
        <div>
          <h3 className="text-sm font-medium mb-2">Historial de pagos</h3>
          {pagos.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay pagos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comprobante</th>
                    {onRemovePayment && (
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => {
                    const removable = canRemovePayment(pago);

                    return (
                      <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                          {formatDate(pago.fechaPago)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.8} />
                            {pago.metodoPago}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {formatCurrency(pago.monto)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {pago.comprobante ? (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" strokeWidth={1.8} />
                              {pago.comprobante}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        {onRemovePayment && (
                          <td className="px-3 py-2 text-center">
                            {removable ? (
                              <button
                                type="button"
                                onClick={() => onRemovePayment(pago.id)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar abono"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center justify-center w-7 h-7 text-gray-300"
                                title="Abono bloqueado"
                              >
                                <Lock className="w-4 h-4" strokeWidth={1.8} />
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mensaje de pago completado */}
        {estaCompletado && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={1.8} />
            <p className="text-sm text-green-800">
              Este pedido ha sido pagado en su totalidad.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsSection;
