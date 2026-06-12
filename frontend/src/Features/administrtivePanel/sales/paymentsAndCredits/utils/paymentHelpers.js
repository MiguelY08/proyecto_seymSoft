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
    .filter((a) => !a.anulado)
    .reduce((acc, a) => acc + Number(a.capitalPagado ?? 0), 0);
};

/**
 * Total abonado a interés activo de UNA factura.
 * Útil para mostrar columna "Abonado Interés".
 */
export const getTotalAbonadoInteres = (factura) => {
  const abonos = factura.abonos ?? [];
  return abonos
    .filter((a) => !a.anulado)
    .reduce((acc, a) => acc + Number(a.interesPagado ?? 0), 0);
};

// Fecha del último abono activo (capital o interés), o null
export const getLastPaymentDate = (abonos = []) => {
  const active = abonos
    .filter((a) => !a.anulado)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return active.length ? active[0].fecha : null;
};

/* ── NIVEL CLIENTE ───────────────────────────────────────────────────────── */

// Suma de valorCredito de todas las facturas del cliente
export const getTotalCreditoCliente = (cliente) => {
  const facturas = cliente.facturas ?? [];
  return facturas.reduce((total, f) => total + (f.valorCredito ?? 0), 0);
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
        const saldoCapital = Math.max(
          0,
          (factura.saldo ?? 0) - (factura.interes ?? 0),
        );
        const saldoInteres = factura.interes ?? 0;
        const saldoTotal = factura.saldo ?? 0;
        const aboCapital = getTotalAbonadoCapital(factura);
        const aboInteres = getTotalAbonadoInteres(factura);
        const estado = factura.estado ?? "al_dia";
        const dueDate = new Date(factura.fechaCredito);
        dueDate.setMonth(dueDate.getMonth() + 2);

        data.push({
          Nro: rowNumber++,
          Documento: cliente.documento,
          "Nombre Cliente": cliente.nombre,
          "Nro Factura": factura.nroFactura,
          "Valor Crédito": factura.valorCredito ?? 0,
          Interés: saldoInteres,
          "Total a Pagar": saldoTotal,
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

    const moneyCols = [4, 5, 6, 9, 10, 11, 12, 13];
    for (let row = 1; row <= range.e.r; row++) {
      moneyCols.forEach((col) => {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cell]) worksheet[cell].z = '"$"#,##0';
      });
    }

    const totCredito = accounts.reduce(
      (s, c) => s + getTotalCreditoCliente(c),
      0,
    );
    const totInteres = accounts.reduce(
      (s, c) =>
        s +
        (c.facturas ?? []).reduce(
          (subtotal, f) => subtotal + (f.interes ?? 0),
          0,
        ),
      0,
    );
    const totSaldo = accounts.reduce((s, c) => s + (c.deudaTotal ?? 0), 0);

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
          totSaldo,
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
