// Archivo centralizado de métodos de pago y sus IDs
export const PAYMENT_METHODS = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Crédito',
  DEVOLUCION: 'Saldo a favor',
};

export const PAYMENT_METHOD_IDS = {
  [PAYMENT_METHODS.TRANSFERENCIA]: 1,
  [PAYMENT_METHODS.EFECTIVO]: 2,
  [PAYMENT_METHODS.CREDITO]: 3,
  [PAYMENT_METHODS.DEVOLUCION]: 4,
};

export const getPaymentMethodId = (methodName) => {
  if (!methodName) return null;
  const method = String(methodName).toLowerCase();

  if (method.includes('transfer')) return PAYMENT_METHOD_IDS[PAYMENT_METHODS.TRANSFERENCIA];
  if (method.includes('efect')) return PAYMENT_METHOD_IDS[PAYMENT_METHODS.EFECTIVO];
  if (method.includes('credit') || /^cr.*dito$/.test(method)) return PAYMENT_METHOD_IDS[PAYMENT_METHODS.CREDITO];
  if (method.includes('saldo') && method.includes('favor')) return PAYMENT_METHOD_IDS[PAYMENT_METHODS.DEVOLUCION];

  return null;
};

export default {
  PAYMENT_METHODS,
  PAYMENT_METHOD_IDS,
  getPaymentMethodId,
};
