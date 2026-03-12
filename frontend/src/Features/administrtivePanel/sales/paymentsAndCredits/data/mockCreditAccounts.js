/* =============================================================================
   mockCreditAccounts.js
   -----------------------------------------------------------------------------
   PROPÓSITO:
     Datos de prueba del módulo de Pagos y Abonos.
     Simula lo que vendría de la base de datos en producción.

   ESTRUCTURA DEL MODELO:
     Cliente (1)
       └── facturas (N)  →  cada factura es una venta a crédito
             └── abonos (N)  →  cada pago parcial o total a esa factura

   REGLAS DE NEGOCIO REFLEJADAS EN LOS DATOS:
     - Un cliente puede tener UNA o VARIAS facturas a crédito activas.
     - Cada factura tiene su propio saldo, estado y abonos independientes.
     - Un abono anulado (anulado: true) NO se descuenta del saldo.
     - El estado de una factura se calcula dinámicamente en paymentHelpers.js:
         · "al_dia"   → saldo <= 0  (pagada completamente)
         · "pendiente"→ tiene saldo y NO ha vencido el plazo de 2 meses
         · "vencido"  → tiene saldo y YA venció el plazo de 2 meses
     - El estado GENERAL del cliente se deriva del peor estado entre sus facturas:
         · Si alguna factura está "vencido"   → cliente = "vencido"
         · Si alguna factura está "pendiente" → cliente = "pendiente"
         · Si todas las facturas están "al_dia" → cliente = "al_dia"

   CAMPOS CLAVE:
     Cliente:
       - id            → identificador único del cliente
       - nombre        → nombre completo
       - documento     → número de cédula o NIT
       - telefono      → para la acción "Contactar" cuando está vencido
       - creditoAsignado → límite de crédito otorgado desde el módulo de Clientes
       - facturas      → array de facturas a crédito del cliente

     Factura:
       - id            → identificador único de la factura
       - nroFactura    → número legible de la factura (ej: "FAC-001")
       - valorCredito  → valor total de la venta a crédito
       - fechaCredito  → fecha en que se generó la venta (fecha de la factura)
       - abonos        → array de pagos realizados a esta factura

     Abono:
       - id            → identificador único del abono (Date.now() en producción)
       - nroAbono      → número secuencial del abono dentro de la factura
       - monto         → valor pagado en este abono
       - fecha         → fecha visible del abono (la que el cajero registra)
       - medioPago     → "Efectivo" | "Transferencia" | "Tarjeta" | "Cheque"
       - observacion   → nota libre del cajero al registrar el abono
       - anulado       → false = activo | true = anulado (no cuenta en saldo)
       - motivoCancelacion → razón de la anulación (se agrega al anular)
       - createdAt     → timestamp real de creación (usado para regla de 48h)
       - cancelledAt   → timestamp de cuando se anuló (se agrega al anular)
============================================================================= */

export const mockCreditAccounts = [

  /* ---------------------------------------------------------------------------
     CLIENTE 1 — María González
     Situación: Tiene 2 facturas. Una pendiente con abono parcial,
                otra al día (pagada completa).
  --------------------------------------------------------------------------- */
  {
    id: 1,
    nombre: "María González",
    documento: "1023456789",
    telefono: "3001112233",

    // Límite de crédito asignado desde el módulo de Clientes
    creditoAsignado: 2000000,

    facturas: [
      {
        id: 101,
        nroFactura: "FAC-001",
        valorCredito: 600000,         // Valor total de esta venta a crédito
        fechaCredito: "2025-11-14",   // Fecha de la venta (inicio del plazo)
        abonos: [
          {
            id: 1001,
            nroAbono: 1,              // Primer abono a esta factura
            monto: 200000,
            fecha: "2025-11-20",
            medioPago: "Efectivo",
            observacion: "Pago parcial en caja",
            anulado: false,
            createdAt: "2025-11-20T10:30:00"
          }
          // Saldo pendiente: 600.000 - 200.000 = 400.000
        ]
      },
      {
        id: 102,
        nroFactura: "FAC-002",
        valorCredito: 300000,
        fechaCredito: "2025-10-05",
        abonos: [
          {
            id: 1002,
            nroAbono: 1,
            monto: 300000,            // Pagó el total → factura al día
            fecha: "2025-10-15",
            medioPago: "Transferencia",
            observacion: "Pago total",
            anulado: false,
            createdAt: "2025-10-15T09:00:00"
          }
          // Saldo: 300.000 - 300.000 = 0 → estado: "al_dia"
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 2 — Carlos Rodríguez
     Situación: Una sola factura con abono fuerte, saldo pequeño pendiente.
  --------------------------------------------------------------------------- */
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    documento: "1098765432",
    telefono: "3015556677",
    creditoAsignado: 3000000,
    facturas: [
      {
        id: 201,
        nroFactura: "FAC-003",
        valorCredito: 1120000,
        fechaCredito: "2025-10-19",
        abonos: [
          {
            id: 2001,
            nroAbono: 1,
            monto: 800000,
            fecha: "2025-10-25",
            medioPago: "Efectivo",
            observacion: "",
            anulado: false,
            createdAt: "2025-10-25T14:00:00"
          }
          // Saldo: 1.120.000 - 800.000 = 320.000 pendiente
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 3 — Laura Pérez
     Situación: Dos facturas, ambas vencidas sin ningún abono.
                Estado general del cliente: VENCIDO.
  --------------------------------------------------------------------------- */
  {
    id: 3,
    nombre: "Laura Pérez",
    documento: "1045678912",
    telefono: "3024445566",
    creditoAsignado: 1500000,
    facturas: [
      {
        id: 301,
        nroFactura: "FAC-004",
        valorCredito: 450000,
        fechaCredito: "2025-09-01",   // Hace más de 2 meses → vencido
        abonos: []                     // Sin abonos → saldo total
      },
      {
        id: 302,
        nroFactura: "FAC-005",
        valorCredito: 320000,
        fechaCredito: "2025-08-15",   // Hace más de 2 meses → vencido
        abonos: []
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 4 — Andrés Martínez
     Situación: Factura con fecha futura (aún no vence), tiene un abono parcial.
                Estado: PENDIENTE (dentro del plazo).
  --------------------------------------------------------------------------- */
  {
    id: 4,
    nombre: "Andrés Martínez",
    documento: "1078945612",
    telefono: "3007778899",
    creditoAsignado: 2500000,
    facturas: [
      {
        id: 401,
        nroFactura: "FAC-006",
        valorCredito: 980000,
        fechaCredito: "2026-01-30",   // Fecha reciente → plazo no vencido
        abonos: [
          {
            id: 4001,
            nroAbono: 1,
            monto: 300000,
            fecha: "2026-02-05",
            medioPago: "Tarjeta",
            observacion: "Pago con datáfono",
            anulado: false,
            createdAt: "2026-02-05T11:00:00"
          }
          // Saldo: 980.000 - 300.000 = 680.000
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 5 — Camila Torres
     Situación: Factura pagada completamente. Estado: AL DÍA.
  --------------------------------------------------------------------------- */
  {
    id: 5,
    nombre: "Camila Torres",
    documento: "1033344455",
    telefono: "3012223344",
    creditoAsignado: 1000000,
    facturas: [
      {
        id: 501,
        nroFactura: "FAC-007",
        valorCredito: 750000,
        fechaCredito: "2025-08-15",
        abonos: [
          {
            id: 5001,
            nroAbono: 1,
            monto: 750000,            // Pago total → al día
            fecha: "2025-08-20",
            medioPago: "Transferencia",
            observacion: "Cancelación total",
            anulado: false,
            createdAt: "2025-08-20T08:30:00"
          }
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 6 — Jorge Ramírez
     Situación: Factura con 2 abonos, uno de ellos ANULADO.
                El abono anulado NO se descuenta → se muestra el proceso completo.
                Útil para probar la vista de abonos con estados mixtos.
  --------------------------------------------------------------------------- */
  {
    id: 6,
    nombre: "Jorge Ramírez",
    documento: "1066677788",
    telefono: "3028889900",
    creditoAsignado: 1200000,
    facturas: [
      {
        id: 601,
        nroFactura: "FAC-008",
        valorCredito: 520000,
        fechaCredito: "2025-11-01",
        abonos: [
          {
            id: 6001,
            nroAbono: 1,
            monto: 100000,
            fecha: "2025-11-05",
            medioPago: "Efectivo",
            observacion: "Primer abono",
            anulado: false,
            createdAt: "2025-11-05T10:00:00"
          },
          {
            id: 6002,
            nroAbono: 2,
            monto: 50000,
            fecha: "2025-11-10",
            medioPago: "Efectivo",
            observacion: "Abono duplicado por error",
            anulado: true,                          // Este NO cuenta en el saldo
            motivoCancelacion: "Registro duplicado",
            createdAt: "2025-11-10T15:00:00",
            cancelledAt: "2025-11-11T09:00:00"
          }
          // Saldo efectivo: 520.000 - 100.000 = 420.000
          // (el abono de 50.000 está anulado, no cuenta)
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 7 — Valentina Herrera
     Situación: Factura vencida con un abono parcial. Debe aparecer como VENCIDO
                y habilitar el botón "Contactar" en el index.
  --------------------------------------------------------------------------- */
  {
    id: 7,
    nombre: "Valentina Herrera",
    documento: "1012345678",
    telefono: "3009998877",
    creditoAsignado: 2000000,
    facturas: [
      {
        id: 701,
        nroFactura: "FAC-009",
        valorCredito: 1300000,
        fechaCredito: "2025-07-20",   // Hace más de 2 meses → vencido
        abonos: [
          {
            id: 7001,
            nroAbono: 1,
            monto: 400000,
            fecha: "2025-07-25",
            medioPago: "Cheque",
            observacion: "Cheque #45231",
            anulado: false,
            createdAt: "2025-07-25T16:00:00"
          }
          // Saldo: 1.300.000 - 400.000 = 900.000 → VENCIDO
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 8 — Sebastián López
     Situación: Factura sin ningún abono y dentro del plazo.
                Estado: PENDIENTE. Permite probar el flujo de primer abono.
  --------------------------------------------------------------------------- */
  {
    id: 8,
    nombre: "Sebastián López",
    documento: "1055566677",
    telefono: "3011234567",
    creditoAsignado: 1500000,
    facturas: [
      {
        id: 801,
        nroFactura: "FAC-010",
        valorCredito: 890000,
        fechaCredito: "2025-12-01",
        abonos: []                     // Aún no ha pagado nada
      }
    ]
  },

  /* ---------------------------------------------------------------------------
     CLIENTE 9 — Daniela Castro
     Situación: Tres facturas con estados distintos para probar la lógica
                del estado general del cliente (se toma el peor estado).
                - FAC-011: al día (pagada)
                - FAC-012: pendiente (con abono parcial, dentro de plazo)
                - FAC-013: vencida (sin abonos, plazo expirado)
                → Estado general del cliente: VENCIDO
  --------------------------------------------------------------------------- */
  {
    id: 9,
    nombre: "Daniela Castro",
    documento: "1099988877",
    telefono: "3004567890",
    creditoAsignado: 3500000,
    facturas: [
      {
        id: 901,
        nroFactura: "FAC-011",
        valorCredito: 500000,
        fechaCredito: "2025-10-01",
        abonos: [
          {
            id: 9001,
            nroAbono: 1,
            monto: 500000,            // Pago total → al día
            fecha: "2025-10-10",
            medioPago: "Transferencia",
            observacion: "",
            anulado: false,
            createdAt: "2025-10-10T10:00:00"
          }
        ]
      },
      {
        id: 902,
        nroFactura: "FAC-012",
        valorCredito: 800000,
        fechaCredito: "2026-02-20",   // Dentro del plazo → pendiente
        abonos: [
          {
            id: 9002,
            nroAbono: 1,
            monto: 200000,
            fecha: "2026-02-22",
            medioPago: "Efectivo",
            observacion: "Primer pago",
            anulado: false,
            createdAt: "2026-02-22T11:00:00"
          }
        ]
      },
      {
        id: 903,
        nroFactura: "FAC-013",
        valorCredito: 600000,
        fechaCredito: "2025-08-01",   // Hace más de 2 meses → vencido
        abonos: []
        // Sin abonos + vencida → peor estado → cliente = VENCIDO
      }
    ]
  }
]