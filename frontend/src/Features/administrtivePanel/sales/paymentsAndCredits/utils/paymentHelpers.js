import * as XLSX from "xlsx";
import React from "react";

/* =============================================================================
   paymentHelpers.js
   REGLAS DE NEGOCIO CENTRALES:
     1. Un abono con anulado=true NUNCA se cuenta.
     2. El plazo de una factura es de 2 meses desde fechaCredito.
     3. El interés (factura.interes) NO afecta el cupo del cliente.
     4. Los abonos se distribuyen: primero cubre interés, luego capital.
        abono.tipo = "capital" | "interes"
     5. Saldo capital  = valorCredito - suma(abonos capital activos)
     6. Saldo interés  = interes      - suma(abonos interés activos)
     7. Saldo total    = saldo capital + saldo interés
     8. Estado factura se calcula sobre el saldo TOTAL (capital + interés)
     9. Cupo ocupado   = saldo CAPITAL únicamente (interés no consume cupo)
    10. Estado cliente = peor estado entre todas sus facturas
============================================================================= */

// ── Resaltador de texto ──────────────────────────────────────────────────────
export const highlight = (text, term) => {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim()})`, "gi");
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? React.createElement(
          "mark",
          { key: i, className: "bg-[#004d7726] text-[#004D77] rounded px-0.5" },
          part,
        )
      : part,
  );
};

/* ── NIVEL ABONO ─────────────────────────────────────────────────────────── */

// "anulado" | "activo"
export const getAbonoStatus = (abono) => (abono.anulado ? "anulado" : "activo");

/* ── NIVEL FACTURA ───────────────────────────────────────────────────────── */

/**
 * Saldo de capital pendiente de UNA factura.
 * Solo suma abonos activos de tipo "capital".
 * Este valor es el que AFECTA el cupo del cliente.
 */
export const calculateSaldoCapital = (factura) => {
  const abonos = factura.abonos ?? [];
  const abonadoCapital = abonos
    .filter((a) => !a.anulado && a.tipo === "capital")
    .reduce((acc, a) => acc + a.monto, 0);
  return Math.max(0, factura.valorCredito - abonadoCapital);
};

/**
 * Saldo de interés pendiente de UNA factura.
 * Solo suma abonos activos de tipo "interes".
 * Este valor NO afecta el cupo del cliente.
 */
export const calculateSaldoInteres = (factura) => {
  const interes = factura.interes ?? 0;
  if (interes <= 0) return 0;
  const abonos = factura.abonos ?? [];
  const abonadoInteres = abonos
    .filter((a) => !a.anulado && a.tipo === "interes")
    .reduce((acc, a) => acc + a.monto, 0);
  return Math.max(0, interes - abonadoInteres);
};

/**
 * Saldo TOTAL de UNA factura = capital pendiente + interés pendiente.
 * Este es el valor real que debe pagar el cliente.
 */
export const calculateSaldoFactura = (factura) => {
  return calculateSaldoCapital(factura) + calculateSaldoInteres(factura);
};

/**
 * Total abonado activo de UNA factura (capital + interés, excluye anulados).
 * Útil para mostrar "Total abonado" en la tabla.
 */
export const getTotalAbonadoFactura = (factura) => {
  const abonos = factura.abonos ?? [];
  return abonos.filter((a) => !a.anulado).reduce((acc, a) => acc + a.monto, 0);
};

/**
 * Total abonado a capital activo de UNA factura.
 * Útil para mostrar columna "Abonado Capital".
 */
export const getTotalAbonadoCapital = (factura) => {
  const abonos = factura.abonos ?? [];
  return abonos
    .filter((a) => !a.anulado && a.tipo === "capital")
    .reduce((acc, a) => acc + a.monto, 0);
};

/**
 * Total abonado a interés activo de UNA factura.
 * Útil para mostrar columna "Abonado Interés".
 */
export const getTotalAbonadoInteres = (factura) => {
  const abonos = factura.abonos ?? [];
  return abonos
    .filter((a) => !a.anulado && a.tipo === "interes")
    .reduce((acc, a) => acc + a.monto, 0);
};

// Estado de UNA factura basado en saldo TOTAL: "al_dia" | "pendiente" | "vencido"
export const getPaymentStatus = (saldo, fechaCredito) => {
  if (saldo <= 0) return "al_dia";
  const dueDate = new Date(fechaCredito);
  dueDate.setMonth(dueDate.getMonth() + 2);
  return new Date() > dueDate ? "vencido" : "pendiente";
};

// Días de mora (0 si no ha vencido)
export const getDaysLate = (fechaCredito) => {
  const dueDate = new Date(fechaCredito);
  dueDate.setMonth(dueDate.getMonth() + 2);
  if (new Date() <= dueDate) return 0;
  return Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24));
};

// Fecha del último abono activo (capital o interés), o null
export const getLastPaymentDate = (abonos = []) => {
  const active = abonos
    .filter((a) => !a.anulado)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return active.length ? active[0].fecha : null;
};

/* ── NIVEL CLIENTE ───────────────────────────────────────────────────────── */

/**
 * Saldo total pendiente del cliente = suma de saldos TOTALES de sus facturas.
 * (capital + interés de todas las facturas)
 */
export const calculateSaldoCliente = (cliente) => {
  const facturas = cliente.facturas ?? [];
  return facturas.reduce((total, f) => total + calculateSaldoFactura(f), 0);
};

/**
 * Cupo ocupado del cliente = suma de saldos de CAPITAL únicamente.
 * El interés no consume cupo — este es el valor que se compara
 * contra creditoAsignado para saber cuánto puede seguir comprando.
 */
export const calculateCupoOcupado = (cliente) => {
  const facturas = cliente.facturas ?? [];
  return facturas.reduce((total, f) => total + calculateSaldoCapital(f), 0);
};

// Estado general del cliente: peor estado entre todas sus facturas
export const getClienteStatus = (cliente) => {
  const facturas = cliente.facturas ?? [];
  if (!facturas.length) return "al_dia";
  const estados = facturas.map((f) =>
    getPaymentStatus(calculateSaldoFactura(f), f.fechaCredito),
  );
  if (estados.includes("vencido")) return "vencido";
  if (estados.includes("pendiente")) return "pendiente";
  return "al_dia";
};

// Suma de valorCredito de todas las facturas del cliente
export const getTotalCreditoCliente = (cliente) => {
  const facturas = cliente.facturas ?? [];
  return facturas.reduce((total, f) => total + f.valorCredito, 0);
};

// Suma de intereses PENDIENTES de todas las facturas del cliente
// (interes generado - abonos de tipo interes activos)
export const getTotalInteresCliente = (cliente) => {
  const facturas = cliente.facturas ?? [];
  return facturas.reduce((total, f) => total + calculateSaldoInteres(f), 0);
};

// Suma de abonos activos (capital + interés) de todas las facturas
export const getTotalAbonadoCliente = (cliente) => {
  const facturas = cliente.facturas ?? [];
  return facturas.reduce((total, f) => total + getTotalAbonadoFactura(f), 0);
};

/* ── EXPORTACIÓN EXCEL ───────────────────────────────────────────────────── */

/**
 * Genera .xlsx con una fila por factura.
 * Columnas: Nro | Documento | Nombre | Nro Factura | Valor Crédito |
 *           Interés | Total a Pagar | Fecha Crédito | Fin Crédito |
 *           Abonado Capital | Abonado Interés | Saldo Capital |
 *           Saldo Interés | Saldo Total | Estado
 */
export const exportAccountsToExcel = (accounts = []) => {
  if (!accounts.length) return false;

  try {
    const data = [];
    let rowNumber = 1;

    accounts.forEach((cliente) => {
      const facturas = cliente.facturas ?? [];
      facturas.forEach((factura) => {
        const saldoCapital = calculateSaldoCapital(factura);
        const saldoInteres = calculateSaldoInteres(factura);
        const saldoTotal = saldoCapital + saldoInteres;
        const aboCapital = getTotalAbonadoCapital(factura);
        const aboInteres = getTotalAbonadoInteres(factura);
        const estado = getPaymentStatus(saldoTotal, factura.fechaCredito);
        const dueDate = new Date(factura.fechaCredito);
        dueDate.setMonth(dueDate.getMonth() + 2);

        data.push({
          Nro: rowNumber++,
          Documento: cliente.documento,
          "Nombre Cliente": cliente.nombre,
          "Nro Factura": factura.nroFactura,
          "Valor Crédito": factura.valorCredito,
          Interés: factura.interes ?? 0,
          "Total a Pagar": factura.valorCredito + (factura.interes ?? 0),
          "Fecha Crédito": factura.fechaCredito,
          "Fin de Crédito": dueDate.toISOString().split("T")[0],
          "Abonado Capital": aboCapital,
          "Abonado Interés": aboInteres,
          "Saldo Capital": saldoCapital,
          "Saldo Interés": saldoInteres,
          "Saldo Total": saldoTotal,
          Estado: estado,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Columnas monetarias: 4=Valor Crédito, 5=Interés, 6=Total a Pagar,
    //                      9=Abo Capital, 10=Abo Interés, 11=Saldo Cap,
    //                      12=Saldo Int, 13=Saldo Total
    const moneyCols = [4, 5, 6, 9, 10, 11, 12, 13];
    for (let row = 1; row <= range.e.r; row++) {
      moneyCols.forEach((col) => {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cell]) worksheet[cell].z = '"$"#,##0';
      });
    }

    // Fila de totales
    const totCredito = accounts.reduce(
      (s, c) => s + getTotalCreditoCliente(c),
      0,
    );
    const totInteres = accounts.reduce(
      (s, c) => s + getTotalInteresCliente(c),
      0,
    );
    const totAbonado = accounts.reduce(
      (s, c) => s + getTotalAbonadoCliente(c),
      0,
    );
    const totSaldo = accounts.reduce((s, c) => s + calculateSaldoCliente(c), 0);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [],
        [
          "",
          "",
          "",
          "TOTALES:",
          totCredito,
          totInteres,
          totCredito + totInteres,
          "",
          "",
          "",
          "",
          "",
          "",
          totSaldo,
          "",
        ],
      ],
      { origin: -1 },
    );

    const newRange = XLSX.utils.decode_range(worksheet["!ref"]);
    const totalRowIndex = newRange.e.r;
    moneyCols.forEach((col) => {
      const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
      if (worksheet[cell]) worksheet[cell].z = '"$"#,##0';
    });

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 22 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 15 },
      { wch: 15 },
      { wch: 14 },
      { wch: 13 },
      { wch: 12 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Créditos");

    const today = new Date().toLocaleDateString("es-CO").replaceAll("/", "-");
    XLSX.writeFile(workbook, `Listado_Creditos_${today}.xlsx`);

    return true;
  } catch (error) {
    console.error("Error exportando Excel:", error);
    return false;
  }
};
