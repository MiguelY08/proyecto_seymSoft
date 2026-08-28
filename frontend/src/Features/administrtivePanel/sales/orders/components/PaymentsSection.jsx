// src/features/orders/components/PaymentsSection.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Plus, DollarSign, Tag, FileText, CheckCircle, CreditCard, Lock, Trash2, AlertTriangle, Pencil, X } from 'lucide-react';
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
  onUpdatePayment,
  loading = false,
  disabled = false,
  isEditMode = false,
  allowCredit = false,
  creditAvailable = null,
  creditAssigned = null,
  allowFavorBalance = false,
  favorBalance = 0,
  financialSummary = null,
  paymentReceipts = [],
}) {
  const [showForm, setShowForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    metodoPago: METODOS_PAGO.EFECTIVO,
    monto: '',
    comprobante: '',
  });
  const [formError, setFormError] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editError, setEditError] = useState('');
  const [paymentReceiptPreview, setPaymentReceiptPreview] = useState(null);
  const paymentFormRef = useRef(null);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (!showForm) return;

    paymentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    amountInputRef.current?.focus({ preventScroll: true });
  }, [showForm]);

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
  const favorBalanceValue = roundMoney(favorBalance);
  const isCreditPayment = newPayment.metodoPago === METODOS_PAGO.CREDITO;
  const isFavorBalancePayment = newPayment.metodoPago === METODOS_PAGO.DEVOLUCION;
  const paymentMethodOptions = [
    { value: METODOS_PAGO.EFECTIVO, label: 'Efectivo' },
    { value: METODOS_PAGO.TRANSFERENCIA, label: 'Transferencia' },
  ];
  const availablePaymentMethodOptions = [
    ...paymentMethodOptions,
    ...(allowCredit ? [{ value: METODOS_PAGO.CREDITO, label: 'Crédito' }] : []),
    ...(allowFavorBalance ? [{ value: METODOS_PAGO.DEVOLUCION, label: 'Saldo a favor' }] : []),
  ];

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

  const formatPaymentRegisteredAt = (payment) => {
    const value = payment?.fechaRegistro ?? payment?.createdAt ?? payment?.fechaPago;
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  };

  const handleMontoChange = (e) => {
    const value = cleanMoneyInput(e.target.value);
    const amount = parseMoneyInput(value);
    setNewPayment(prev => ({ ...prev, monto: value }));
    if (amount > saldoPendiente) {
      setFormError(`El monto excede el saldo pendiente (${formatCurrency(saldoPendiente)}).`);
      return;
    }
    if (isFavorBalancePayment && amount > favorBalanceValue) {
      setFormError(`El monto excede el saldo a favor disponible (${formatCurrency(favorBalanceValue)}).`);
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
      setFormError('El pago a crédito no está disponible para pedidos.');
      return;
    }
    if (newPayment.metodoPago === METODOS_PAGO.DEVOLUCION && monto > favorBalanceValue) {
      setFormError(`El monto excede el saldo a favor disponible (${formatCurrency(favorBalanceValue)}).`);
      return;
    }
    if (newPayment.metodoPago === METODOS_PAGO.CREDITO && creditLimit !== null && monto > creditLimit) {
      setFormError(`El monto supera el cupo disponible (${formatCurrency(creditLimit)}).`);
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

  const canEditPayment = (pago) =>
    Boolean(onUpdatePayment) &&
    !loading &&
    !disabled &&
    !pago.locked &&
    !pago.isLocked &&
    !pago.persisted;

  const startPaymentEdit = (pago) => {
    setEditingPaymentId(pago.id);
    setEditingAmount(String(roundMoney(pago.monto)));
    setEditError('');
  };

  const getReceiptForPayment = (payment) => {
    const reference = String(
      payment?.referencia ?? payment?.comprobante ?? payment?.reference ?? ''
    ).trim().toLowerCase();

    if (!reference) return null;

    return paymentReceipts.find((receipt) => {
      const fileName = String(receipt?.fileName || '').trim().toLowerCase();
      return String(receipt?.status || '').trim().toLowerCase() === 'aprobado' && fileName && reference.includes(fileName);
    }) || null;
  };

  const cancelPaymentEdit = () => {
    setEditingPaymentId(null);
    setEditingAmount('');
    setEditError('');
  };

  const savePaymentEdit = (pago) => {
    const monto = parseMoneyInput(editingAmount);
    const maxAllowed = roundMoney(saldoPendiente + Number(pago.monto || 0));

    if (monto <= 0) {
      setEditError('El monto debe ser un número mayor a cero.');
      return;
    }
    if (Math.round(monto * 100) > Math.round(maxAllowed * 100)) {
      setEditError(`El monto excede el saldo disponible (${formatCurrency(maxAllowed)}).`);
      return;
    }

    onUpdatePayment(pago.id, monto);
    cancelPaymentEdit();
  };

  const handleEditingAmountChange = (pago, value) => {
    const cleanValue = cleanMoneyInput(value);
    const monto = parseMoneyInput(cleanValue);
    const maxAllowed = roundMoney(saldoPendiente + Number(pago.monto || 0));

    setEditingAmount(cleanValue);

    if (monto > maxAllowed) {
      setEditError(`El monto excede el saldo disponible (${formatCurrency(maxAllowed)}).`);
      return;
    }

    setEditError('');
  };

  const handleTogglePaymentForm = () => {
    setShowForm((current) => !current);
    setFormError('');
  };

  // Clases unificadas
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputBaseClass = "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 focus:ring-2 focus:ring-[#004D77]/20 focus:border-[#004D77]";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header de sección estilo ventas */}
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">Pagos</p>
            <p className="text-xs text-gray-400">Gestión de pagos del pedido</p>
          </div>
        </div>
        {!estaCompletado && !disabled && (
          <button
            onClick={handleTogglePaymentForm}
            disabled={loading || disabled}
            className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-2 text-sm text-[#004D77] transition-colors duration-200 hover:bg-[#004D77]/10 sm:w-auto sm:py-1"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            Agregar pago
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Resumen de montos */}
        <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-3 sm:gap-4">
          <div>
            <p className="text-xs text-gray-500">Total del pedido</p>
            <p className="text-base font-semibold sm:text-lg">{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total pagado</p>
            <p className="text-base font-semibold text-green-600 sm:text-lg">{formatCurrency(totalPagado)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo pendiente</p>
            <p className={`text-base font-semibold sm:text-lg ${saldoPendiente > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {formatCurrency(saldoPendiente)}
            </p>
          </div>
        </div>

        {financialSummary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Saldo a favor', financialSummary.favorBalance, 'text-emerald-700', 'bg-emerald-50 border-emerald-100'],
              ['Crédito', financialSummary.assignedCredit, 'text-sky-700', 'bg-sky-50 border-sky-100'],
              ['Crédito disponible', financialSummary.availableCredit, 'text-indigo-700', 'bg-indigo-50 border-indigo-100'],
              ['Monto ocupado', financialSummary.usedCredit, 'text-amber-700', 'bg-amber-50 border-amber-100'],
            ].map(([label, amount, textClass, backgroundClass]) => (
              <div key={label} className={`rounded-lg border p-3 ${backgroundClass}`}>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className={`mt-1 text-base font-semibold ${textClass}`}>{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar pago */}
        {showForm && !estaCompletado && !disabled && (
          <form ref={paymentFormRef} onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-medium mb-3">Nuevo abono</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    if (
                      value === METODOS_PAGO.DEVOLUCION &&
                      montoPreview > favorBalanceValue
                    ) {
                      setFormError(`El monto excede el saldo a favor disponible (${formatCurrency(favorBalanceValue)}).`);
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
                    ref={amountInputRef}
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

                {isFavorBalancePayment && (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <CreditCard
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                      strokeWidth={1.8}
                    />
                    <p className="text-sm font-medium text-emerald-800">
                      Saldo a favor disponible: {formatCurrency(favorBalanceValue)}
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

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="w-full rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer sm:w-auto"
                disabled={loading || disabled}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || disabled || Boolean(formError)}
                className="w-full rounded-lg bg-[#004D77] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
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
            <div className="overflow-x-auto rounded-lg border border-gray-200 [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[680px] divide-y divide-gray-200 lg:min-w-0">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha de registro</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comprobante</th>
                    {(onRemovePayment || onUpdatePayment) && (
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => {
                    const removable = canRemovePayment(pago);
                    const receipt = getReceiptForPayment(pago);

                    return (
                      <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                          {formatPaymentRegisteredAt(pago)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.8} />
                            {pago.metodoPago}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {editingPaymentId === pago.id ? (
                            <div>
                              <input
                                autoFocus
                                type="text"
                                inputMode="numeric"
                                value={formatMoneyInput(editingAmount)}
                                onChange={(event) => handleEditingAmountChange(pago, event.target.value)}
                                className={`w-28 rounded-md border bg-amber-50 px-2 py-1 text-sm outline-none ring-2 ${editError ? 'border-red-500 ring-red-100 focus:border-red-500 focus:ring-red-200' : 'border-amber-400 ring-amber-100 focus:border-amber-500 focus:ring-amber-200'}`}
                                aria-label="Nuevo monto del pago"
                                aria-invalid={Boolean(editError)}
                              />
                              <p className={`mt-1 text-xs font-normal ${editError ? 'text-red-600' : 'text-amber-700'}`}>
                                {editError || `Máximo permitido: ${formatCurrency(roundMoney(saldoPendiente + Number(pago.monto || 0)))}`}
                              </p>
                            </div>
                          ) : (
                            formatCurrency(pago.monto)
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {receipt ? (
                            <button
                              type="button"
                              onClick={() => setPaymentReceiptPreview(receipt)}
                              className="inline-flex max-w-full items-center gap-1.5 text-[#004D77] transition hover:text-[#003a5c]"
                              title="Ver comprobante"
                            >
                              <img
                                src={receipt.imageUrl}
                                alt={receipt.fileName || 'Comprobante'}
                                className="h-7 w-7 shrink-0 rounded object-cover"
                              />
                              <span className="truncate text-xs font-semibold">{receipt.fileName || 'Comprobante de pago'}</span>
                            </button>
                          ) : pago.comprobante ? (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" strokeWidth={1.8} />
                              {pago.comprobante}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        {(onRemovePayment || onUpdatePayment) && (
                          <td className="px-3 py-2 text-center">
                            {editingPaymentId === pago.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button type="button" onClick={() => savePaymentEdit(pago)} disabled={Boolean(editError) || !editingAmount} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40" title="Guardar monto">
                                  <CheckCircle className="w-4 h-4" strokeWidth={1.8} />
                                </button>
                                <button type="button" onClick={cancelPaymentEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100" title="Cancelar edición">
                                  <X className="w-4 h-4" strokeWidth={1.8} />
                                </button>
                              </div>
                            ) : canEditPayment(pago) || removable ? (
                              <div className="inline-flex items-center gap-1">
                                {canEditPayment(pago) && (
                                  <button type="button" onClick={() => startPaymentEdit(pago)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#004D77] transition-colors hover:bg-[#004D77]/10" title="Editar pago">
                                    <Pencil className="w-4 h-4" strokeWidth={1.8} />
                                  </button>
                                )}
                                {removable && (
                                  <button
                                    type="button"
                                    onClick={() => onRemovePayment(pago.id)}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Eliminar abono"
                                  >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                                  </button>
                                )}
                              </div>
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
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={1.8} />
            <p className="text-sm text-green-800">
              Este pedido ha sido pagado en su totalidad.
            </p>
          </div>
        )}
      </div>

      {paymentReceiptPreview?.imageUrl && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => setPaymentReceiptPreview(null)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-2xl bg-white p-3 pt-12 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-4 sm:pt-14"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPaymentReceiptPreview(null)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Cerrar comprobante"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <img
              src={paymentReceiptPreview.imageUrl}
              alt={paymentReceiptPreview.fileName || 'Comprobante de pago'}
              className="mx-auto max-h-[76vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsSection;
