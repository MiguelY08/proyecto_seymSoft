// src/Features/sales/paymentsAndCredits/mappers/paymentsMapper.js

/**
 * =====================================================
 * CUSTOMER
 * Backend -> Frontend
 * =====================================================
 */
export const mapCustomer = (customer) => ({
  id: customer.idClient,

  nombre: customer.fullName,

  telefono: customer.phone,

  creditoAsignado:
    Number(customer.assignedCredit ?? 0),

  saldo:
    Number(customer.usedCredit ?? 0),

  cupoDisponible:
    Number(customer.availableCredit ?? 0),

  deudaTotal:
    Number(customer.totalDebt ?? 0),

  creditosActivos:
    Number(customer.activeCredits ?? 0),

  estado:
    customer.status?.toLowerCase() ??
    "al_dia",
});

/**
 * =====================================================
 * INVOICE
 * Backend -> Frontend
 * =====================================================
 */
export const mapInvoice = (invoice) => {
  const statusMap = {
    pendiente: "pendiente",
    vencido: "vencido",
    pagado: "al_dia",
  };

  return {
    id: invoice.idCredit,

    idCredit: invoice.idCredit,

    idSale: invoice.idSale,

    nroFactura: invoice.idSale,

    valorCredito:
      Number(invoice.creditAmount ?? 0),

    saldo:
      Number(invoice.remainingBalance ?? 0),

    interes:
      Number(invoice.pendingInterest ?? 0),

    deudaTotal:
      Number(invoice.totalDebt ?? 0),

    totalAbonado:
      Number(invoice.totalPaid ?? 0),

    fechaCredito:
      invoice.saleDate,

    fechaVencimiento:
      invoice.dueDate,

    estado:
      statusMap[
        invoice.status?.name?.toLowerCase()
      ] ?? "al_dia",
  };
};

/**
 * =====================================================
 * INSTALLMENT
 * Backend -> Frontend
 * =====================================================
 */
export const mapInstallment = (installment) => ({
  id: installment.idInstallment,

  nroAbono: installment.idInstallment,

  fecha: installment.installmentDate,

  monto: Number(installment.installmentAmount ?? 0),

  capitalPagado: Number(installment.capitalPaid ?? 0),

  interesPagado: Number(installment.interestPaid ?? 0),

  medioPago: installment.paymentMethod?.nombre || "N/A",  // ✅ CAMBIO: extrae .nombre

  observacion: installment.observations,

  anulado: installment.isCancelled,

  cancelledAt: installment.cancelledAt,

  motivoCancelacion: installment.cancellationReason,

  cancelledBy: installment.cancelledBy
    ? {
        id: installment.cancelledBy.id,  // ← DTO tiene .id
        nombre: installment.cancelledBy.nombre,  // ✅ CAMBIO: es .nombre no .fullName
      }
    : null,
});

/**
 * =====================================================
 * CUSTOMER CONTACT
 * Backend -> Frontend
 * =====================================================
 */
export const mapCustomerContact = (
  contact
) => ({
  id: contact.idClient,

  nombre:
    contact.fullName,

  telefono:
    contact.phone,

  creditosVencidos:
    (
      contact.overdueCredits ?? []
    ).map((credit) => ({
      idCredit:
        credit.idCredit,

      idSale:
        credit.idSale,

      saldo:
        Number(
          credit.remainingBalance ?? 0
        ),

      diasVencido:
        credit.overdueDays,
    })),
});

/**
 * =====================================================
 * LIST HELPERS
 * =====================================================
 */
export const mapCustomers = (
    customers = []
    ) =>
    customers.map(mapCustomer);

    export const mapInvoices = (
    invoices = []
    ) =>
    invoices.map(mapInvoice);

    export const mapInstallments = (
    installments = []
    ) =>
    installments.map(mapInstallment);


// mapp payment methods

export const mapPaymentMethod = (
  method
) => ({
  id:
    method.idPaymentMethod,

  nombre:
    method.name,
});

export const mapPaymentMethods =
  (methods = []) =>
    methods.map(
      mapPaymentMethod
    );