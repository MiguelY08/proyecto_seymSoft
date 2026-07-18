// src/features/sales/paymentsAndCredits/mappers/paymentsMapper.js

const getPersonName = (person) => {
  if (!person) return null;
  if (typeof person === "string") return person;

  const composedName =
    [person.firstName, person.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  const directName =
    person.nombre ??
    person.fullName ??
    person.name ??
    person.userName ??
    person.username ??
    composedName;

  return directName || getPersonName(person.user) || person.email || null;
};

/**
 * =====================================================
 * CUSTOMER
 * Backend -> Frontend
 * =====================================================
 */
export const mapCustomer = (customer) => ({
  id: customer.idClient,

  nombre: customer.fullName,

  documento: customer.doc_number,

  telefono: customer.phone,

  correo:
    customer.email ??
    customer.correo ??
    customer.mail ??
    customer.user?.email ??
    "",

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
      Number(
        invoice.creditAmount ??
        invoice.credit_amount ??
        0
      ),

    saldo:
      Number(
        invoice.remainingBalance ??
        invoice.remaining_balance ??
        0
      ),

    interes:
      Number(
        invoice.pendingInterest ??
        invoice.pending_interest ??
        0
      ),

    deudaTotal:
      Number(
        invoice.totalDebt ??
        invoice.total_debt ??
        0
      ),

    totalAbonado:
      Number(
        invoice.totalPaid ??
        invoice.total_paid ??
        0
      ),

    fechaCredito:
      invoice.creditDate ??
      invoice.credit_date ??
      invoice.saleDate ??
      invoice.sale_date,

    fechaVencimiento:
      invoice.dueDate ??
      invoice.due_date ??
      invoice.fechaVencimiento ??
      invoice.fecha_vencimiento,

    observacion:
      invoice.observations ??
      invoice.observation ??
      invoice.description ??
      invoice.descripcion ??
      "",

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

  createdAt:
    installment.createdAt ??
    installment.creationDate ??
    installment.created_at ??
    installment.installmentDate,

  monto: Number(installment.installmentAmount ?? 0),

  capitalPagado: Number(installment.capitalPaid ?? 0),

  interesPagado: Number(installment.interestPaid ?? 0),

  medioPago: installment.paymentMethod?.nombre || "N/A",  // ✅ CAMBIO: extrae .nombre

  observacion: installment.observations,

  isCancelled: installment.isCancelled,

  anulado: installment.isCancelled,

  registeredBy: installment.registeredBy
    ? {
        id:
          installment.registeredBy.id ??
          installment.registeredBy.idUser ??
          installment.registeredBy.user?.id ??
          installment.registeredBy.user?.idUser,
        nombre: getPersonName(installment.registeredBy),
      }
    : null,

  cancelledAt: installment.cancelledAt,

  cancellationReason: installment.cancellationReason,

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
export const mapCustomerContact = (contact ) => {


  const mapped = {
    id: contact.idClient,

    nombre: contact.fullName,

    telefono: contact.phone,

    ultimoPago:
      contact.lastPaymentDate,

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
  };


  return mapped;
};
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
