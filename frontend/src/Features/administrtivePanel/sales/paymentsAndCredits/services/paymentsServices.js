import apiClient from "../../../../../setting/apiClient.js";

/* ==========================================
   CLIENTES CON CRÉDITOS
========================================== */

export const getCreditCustomers = async () => {
  const response = await apiClient.get("/payments/customers");

  return response.data.data;
};

/* ==========================================
   FACTURAS DE UN CLIENTE
========================================== */

export const getCustomerInvoices = async (idCustomer) => {
  const response = await apiClient.get(
    `/payments/customers/${idCustomer}/invoices`,
  );

  return response.data.data;
};

/* ==========================================
   CONTACTO CLIENTE
========================================== */

export const getCustomerContact = async (idCustomer) => {
  const response = await apiClient.get(
    `/payments/customers/${idCustomer}/contact`,
  );

  return response.data.data;
};

/* ==========================================
   HISTORIAL DE ABONOS
========================================== */

export const getInvoiceInstallments = async (idSale) => {
  const response = await apiClient.get(
    `/payments/invoices/${idSale}/installments`,
  );

  return response.data.data;
};

/* ==========================================
   REGISTRAR ABONO
========================================== */

export const createInstallment = async (payload) => {
  const response = await apiClient.post("/payments/installments", payload);

  return response.data.data;
};

/* ==========================================
   ANULAR ABONO
========================================== */

export const cancelInstallment = async (idInstallment, reason, password) => {
  const response = await apiClient.patch(
    `/payments/installments/${idInstallment}/cancel`,
    {
      reason,
      cancellationReason: reason,
      password,
    },
  );

  return response.data.data;
};

/* ==========================================
   GENERAR INTERÉS
========================================== */

export const generateInterest = async ({ id_credit, percentage }) => {
  const response = await apiClient.post("/payments/interests", {
    id_credit,
    percentage,
  });

  return response.data.data;
};
