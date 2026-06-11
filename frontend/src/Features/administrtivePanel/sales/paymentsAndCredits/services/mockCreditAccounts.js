/* =============================================================================
   mockCreditAccounts.js
   Datos de prueba para el módulo de Pagos y Abonos.

   MODELO:
     Cliente → facturas[] → abonos[]

   CAMPOS NUEVOS:
     factura.interes     → interés acumulado aplicado por mora (NO afecta cupo)
     abono.tipo          → "capital" | "interes"
                           capital  = reduce valorCredito (libera cupo)
                           interes  = reduce factura.interes (no toca cupo)

   REGLA DE DISTRIBUCIÓN DE ABONOS:
     Cuando el cliente abona, se aplica en este orden:
       1° → cubre interés pendiente  (abono.tipo = "interes")
       2° → cubre capital            (abono.tipo = "capital")

   ESCENARIOS CUBIERTOS:
     1. Cliente al día, sin interés                        (Camila Torres)
     2. Cliente pendiente, sin interés                     (Andrés Martínez)
     3. Cliente vencido, con interés generado              (María González)
     4. Cliente vencido, interés parcialmente pagado       (Carlos Rodríguez)
     5. Cliente vencido, interés totalmente pagado         (Jorge Ramírez)
     6. Cliente con abono anulado                          (Laura Pérez)
     7. Cliente con múltiples facturas, mix de estados     (Daniela Castro)
     8. Cliente sin abonos                                 (Sebastián López)
     9. Cliente al día en todas sus facturas               (Valentina Herrera)
============================================================================= */

const mockCreditAccounts = [

  /* ── 1. MARÍA GONZÁLEZ ─────────────────────────────────────────────────────
     Vencido | FAC-001 con interés pendiente, FAC-002 pagada (al día)         */
  {
    id:               "cliente-001",
    nombre:           "María González",
    documento:        "1023456789",
    telefono:         "3001112233",
    creditoAsignado:  2000000,
    facturas: [
      {
        id:           "fac-001",
        nroFactura:   "FAC-001",
        valorCredito: 600000,
        interes:      60000,      // ← interés aplicado por mora (10%)
        fechaCredito: "2024-10-01",
        abonos: [
          {
            id:          "abo-001",
            nroAbono:    1,
            monto:       60000,
            fecha:       "2025-01-10",
            medioPago:   "Efectivo",
            observacion: "Pago interés mora",
            tipo:        "interes",   // cubre el interés primero
            anulado:     false,
            createdAt:   "2025-01-10T09:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-002",
            nroAbono:    2,
            monto:       80000,
            fecha:       "2025-01-10",
            medioPago:   "Efectivo",
            observacion: "Abono a capital",
            tipo:        "capital",   // luego al capital
            anulado:     false,
            createdAt:   "2025-01-10T09:05:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-002",
        nroFactura:   "FAC-002",
        valorCredito: 420000,
        interes:      0,
        fechaCredito: "2025-08-15",
        abonos: [
          {
            id:          "abo-003",
            nroAbono:    1,
            monto:       420000,
            fecha:       "2025-09-01",
            medioPago:   "Transferencia",
            observacion: "Pago total",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2025-09-01T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },

  /* ── 2. CARLOS RODRÍGUEZ ───────────────────────────────────────────────────
     Vencido | Interés parcialmente pagado (queda interés pendiente)          */
  {
    id:               "cliente-002",
    nombre:           "Carlos Rodríguez",
    documento:        "9876543210",
    telefono:         "3109876543",
    creditoAsignado:  3000000,
    facturas: [
      {
        id:           "fac-003",
        nroFactura:   "FAC-003",
        valorCredito: 800000,
        interes:      80000,      // interés aplicado, solo pagaron $30.000
        fechaCredito: "2024-09-10",
        abonos: [
          {
            id:          "abo-004",
            nroAbono:    1,
            monto:       30000,
            fecha:       "2024-12-05",
            medioPago:   "Efectivo",
            observacion: "Abono parcial interés",
            tipo:        "interes",
            anulado:     false,
            createdAt:   "2024-12-05T11:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-005",
            nroAbono:    2,
            monto:       450000,
            fecha:       "2025-01-20",
            medioPago:   "Transferencia",
            observacion: "Abono capital",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2025-01-20T14:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-004",
        nroFactura:   "FAC-004",
        valorCredito: 320000,
        interes:      0,
        fechaCredito: "2024-11-20",
        abonos: []
      }
    ]
  },

  /* ── 3. LAURA PÉREZ ────────────────────────────────────────────────────────
     Vencido | Tiene un abono anulado                                         */
  {
    id:               "cliente-003",
    nombre:           "Laura Pérez",
    documento:        "1122334455",
    telefono:         "3205556677",
    creditoAsignado:  1500000,
    facturas: [
      {
        id:           "fac-005",
        nroFactura:   "FAC-005",
        valorCredito: 770000,
        interes:      77000,
        fechaCredito: "2024-08-20",
        abonos: [
          {
            id:          "abo-006",
            nroAbono:    1,
            monto:       77000,
            fecha:       "2024-11-01",
            medioPago:   "Efectivo",
            observacion: "Pago interés",
            tipo:        "interes",
            anulado:     false,
            createdAt:   "2024-11-01T08:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-007",
            nroAbono:    2,
            monto:       200000,
            fecha:       "2024-11-15",
            medioPago:   "Transferencia",
            observacion: "Abono capital — ANULADO",
            tipo:        "capital",
            anulado:     true,        // ← anulado, no se cuenta
            createdAt:   "2024-11-15T10:00:00",
            cancelledAt: "2024-11-16T09:00:00",
            motivoCancelacion: "Error en el monto registrado"
          }
        ]
      }
    ]
  },

  /* ── 4. ANDRÉS MARTÍNEZ ────────────────────────────────────────────────────
     Pendiente | Sin interés, dentro del plazo                                */
  {
    id:               "cliente-004",
    nombre:           "Andrés Martínez",
    documento:        "5544332211",
    telefono:         "3154443322",
    creditoAsignado:  2500000,
    facturas: [
      {
        id:           "fac-006",
        nroFactura:   "FAC-006",
        valorCredito: 580000,
        interes:      0,
        fechaCredito: "2026-01-10",
        abonos: [
          {
            id:          "abo-008",
            nroAbono:    1,
            monto:       200000,
            fecha:       "2026-02-01",
            medioPago:   "Efectivo",
            observacion: "Primer abono",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-01T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-007",
        nroFactura:   "FAC-007",
        valorCredito: 400000,
        interes:      0,
        fechaCredito: "2026-02-05",
        abonos: [
          {
            id:          "abo-009",
            nroAbono:    1,
            monto:       180000,
            fecha:       "2026-02-20",
            medioPago:   "Tarjeta",
            observacion: "Abono parcial",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-20T15:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },

  /* ── 5. CAMILA TORRES ──────────────────────────────────────────────────────
     Al día | Todo pagado, sin interés                                        */
  {
    id:               "cliente-005",
    nombre:           "Camila Torres",
    documento:        "6677889900",
    telefono:         "3006667788",
    creditoAsignado:  1000000,
    facturas: [
      {
        id:           "fac-008",
        nroFactura:   "FAC-008",
        valorCredito: 750000,
        interes:      0,
        fechaCredito: "2025-06-01",
        abonos: [
          {
            id:          "abo-010",
            nroAbono:    1,
            monto:       400000,
            fecha:       "2025-07-01",
            medioPago:   "Transferencia",
            observacion: "Primer pago",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2025-07-01T09:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-011",
            nroAbono:    2,
            monto:       350000,
            fecha:       "2025-07-25",
            medioPago:   "Efectivo",
            observacion: "Pago total restante",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2025-07-25T11:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },

  /* ── 6. JORGE RAMÍREZ ──────────────────────────────────────────────────────
     Vencido | Interés totalmente pagado, queda capital pendiente             */
  {
    id:               "cliente-006",
    nombre:           "Jorge Ramírez",
    documento:        "2233445566",
    telefono:         "3112223344",
    creditoAsignado:  1200000,
    facturas: [
      {
        id:           "fac-009",
        nroFactura:   "FAC-009",
        valorCredito: 520000,
        interes:      52000,      // interés 100% pagado
        fechaCredito: "2024-07-15",
        abonos: [
          {
            id:          "abo-012",
            nroAbono:    1,
            monto:       52000,
            fecha:       "2024-10-01",
            medioPago:   "Efectivo",
            observacion: "Pago total interés mora",
            tipo:        "interes",   // cubre el interés completo
            anulado:     false,
            createdAt:   "2024-10-01T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-013",
            nroAbono:    2,
            monto:       100000,
            fecha:       "2024-10-15",
            medioPago:   "Transferencia",
            observacion: "Abono capital",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2024-10-15T14:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },

  /* ── 7. VALENTINA HERRERA ──────────────────────────────────────────────────
     Vencido | Múltiples facturas, una al día y otra vencida con interés      */
  {
    id:               "cliente-007",
    nombre:           "Valentina Herrera",
    documento:        "3344556677",
    telefono:         "3187776655",
    creditoAsignado:  2000000,
    facturas: [
      {
        id:           "fac-010",
        nroFactura:   "FAC-010",
        valorCredito: 800000,
        interes:      0,
        fechaCredito: "2025-05-01",
        abonos: [
          {
            id:          "abo-014",
            nroAbono:    1,
            monto:       800000,
            fecha:       "2025-06-15",
            medioPago:   "Transferencia",
            observacion: "Pago completo",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2025-06-15T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-011",
        nroFactura:   "FAC-011",
        valorCredito: 900000,
        interes:      90000,
        fechaCredito: "2024-06-10",
        abonos: []    // sin abonos — debe capital + interés completo
      }
    ]
  },

  /* ── 8. SEBASTIÁN LÓPEZ ────────────────────────────────────────────────────
     Vencido | Sin abonos en ninguna factura                                  */
  {
    id:               "cliente-008",
    nombre:           "Sebastián López",
    documento:        "4455667788",
    telefono:         "3223334455",
    creditoAsignado:  1500000,
    facturas: [
      {
        id:           "fac-012",
        nroFactura:   "FAC-012",
        valorCredito: 890000,
        interes:      89000,
        fechaCredito: "2024-05-20",
        abonos: []
      }
    ]
  },

  /* ── 9. DANIELA CASTRO ─────────────────────────────────────────────────────
     Vencido | 3 facturas: al_dia + pendiente + vencida con interés           */
  {
    id:               "cliente-009",
    nombre:           "Daniela Castro",
    documento:        "5566778899",
    telefono:         "3045556677",
    creditoAsignado:  3500000,
    facturas: [
      {
        id:           "fac-013",
        nroFactura:   "FAC-013",
        valorCredito: 400000,
        interes:      0,
        fechaCredito: "2025-07-01",
        abonos: [
          {
            id:          "abo-015",
            nroAbono:    1,
            monto:       400000,
            fecha:       "2025-08-10",
            medioPago:   "Efectivo",
            observacion: "Pago completo",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2025-08-10T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-014",
        nroFactura:   "FAC-014",
        valorCredito: 600000,
        interes:      0,
        fechaCredito: "2026-01-15",
        abonos: [
          {
            id:          "abo-016",
            nroAbono:    1,
            monto:       100000,
            fecha:       "2026-02-01",
            medioPago:   "Transferencia",
            observacion: "Abono inicial",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-01T09:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-015",
        nroFactura:   "FAC-015",
        valorCredito: 900000,
        interes:      90000,
        fechaCredito: "2024-04-01",
        abonos: [
          {
            id:          "abo-017",
            nroAbono:    1,
            monto:       90000,
            fecha:       "2024-07-01",
            medioPago:   "Efectivo",
            observacion: "Pago interés mora",
            tipo:        "interes",
            anulado:     false,
            createdAt:   "2024-07-01T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-018",
            nroAbono:    2,
            monto:       200000,
            fecha:       "2024-08-15",
            medioPago:   "Cheque",
            observacion: "Abono capital",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2024-08-15T11:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },
    /* ── 10. JULIÁN SALAZAR ───────────────────────────────────────────────────
     Pendiente | Dentro del plazo, sin interés                                */
  {
    id:               "cliente-010",
    nombre:           "Julián Salazar",
    documento:        "7788990011",
    telefono:         "3001234567",
    creditoAsignado:  1800000,
    facturas: [
      {
        id:           "fac-016",
        nroFactura:   "FAC-016",
        valorCredito: 500000,
        interes:      0,
        fechaCredito: "2026-02-01",
        abonos: [
          {
            id:          "abo-019",
            nroAbono:    1,
            monto:       150000,
            fecha:       "2026-02-20",
            medioPago:   "Efectivo",
            observacion: "Abono parcial",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-20T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },

  /* ── 11. NATALIA RÍOS ─────────────────────────────────────────────────────
     Pendiente | Sin abonos aún                                              */
  {
    id:               "cliente-011",
    nombre:           "Natalia Ríos",
    documento:        "8899001122",
    telefono:         "3012223344",
    creditoAsignado:  2200000,
    facturas: [
      {
        id:           "fac-017",
        nroFactura:   "FAC-017",
        valorCredito: 700000,
        interes:      0,
        fechaCredito: "2026-02-10",
        abonos: []
      }
    ]
  },

  /* ── 12. FELIPE DUQUE ─────────────────────────────────────────────────────
     Pendiente | Con varios abonos dentro del plazo                          */
  {
    id:               "cliente-012",
    nombre:           "Felipe Duque",
    documento:        "9900112233",
    telefono:         "3023334455",
    creditoAsignado:  2500000,
    facturas: [
      {
        id:           "fac-018",
        nroFactura:   "FAC-018",
        valorCredito: 900000,
        interes:      0,
        fechaCredito: "2026-01-25",
        abonos: [
          {
            id:          "abo-020",
            nroAbono:    1,
            monto:       200000,
            fecha:       "2026-02-05",
            medioPago:   "Transferencia",
            observacion: "Primer abono",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-05T09:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          },
          {
            id:          "abo-021",
            nroAbono:    2,
            monto:       150000,
            fecha:       "2026-02-25",
            medioPago:   "Efectivo",
            observacion: "Segundo abono",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-25T11:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      }
    ]
  },

  /* ── 13. PAULA MEJÍA ──────────────────────────────────────────────────────
     Pendiente | Múltiples facturas dentro del plazo                         */
  {
    id:               "cliente-013",
    nombre:           "Paula Mejía",
    documento:        "1011223344",
    telefono:         "3034445566",
    creditoAsignado:  3000000,
    facturas: [
      {
        id:           "fac-019",
        nroFactura:   "FAC-019",
        valorCredito: 600000,
        interes:      0,
        fechaCredito: "2026-02-01",
        abonos: [
          {
            id:          "abo-022",
            nroAbono:    1,
            monto:       100000,
            fecha:       "2026-02-18",
            medioPago:   "Efectivo",
            observacion: "Abono inicial",
            tipo:        "capital",
            anulado:     false,
            createdAt:   "2026-02-18T10:00:00",
            cancelledAt: null,
            motivoCancelacion: null
          }
        ]
      },
      {
        id:           "fac-020",
        nroFactura:   "FAC-020",
        valorCredito: 400000,
        interes:      0,
        fechaCredito: "2026-02-12",
        abonos: []
      }
    ]
  }

]

export default mockCreditAccounts