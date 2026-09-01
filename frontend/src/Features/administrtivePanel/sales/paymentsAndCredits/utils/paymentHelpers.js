import { saveAs } from "file-saver";
import React from "react";
import { createExcelLogoId, prepareExcelLogoHeader } from "../../../../shared/excel/logoHeader";

const COMPANY_COLOR = "004D77";
const LIGHT_BLUE = "DCEBF3";
const LIGHT_GRAY = "F3F4F6";
const WHITE = "FFFFFF";

const createExcelWorkbook = async () => {
  const { default: ExcelJS } = await import("exceljs");
  return new ExcelJS.Workbook();
};

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
const exportAccountsSummaryToExcel = async (accounts = []) => {
  const workbook = await createExcelWorkbook();
  const worksheet = workbook.addWorksheet("Pagos y Abonos");
  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split("T")[0];

  workbook.creator = "SeymSoft";
  workbook.created = currentDate;

  worksheet.columns = [
    { key: "documento", width: 16 },
    { key: "nombre", width: 32 },
    { key: "creditoAsignado", width: 18 },
    { key: "cupoOcupado", width: 18 },
    { key: "cupoDisponible", width: 18 },
    { key: "creditosActivos", width: 18 },
    { key: "estado", width: 16 },
  ];

  const logoId = await createExcelLogoId(workbook);
  prepareExcelLogoHeader(worksheet, {
    title: "PAGOS Y ABONOS",
    subtitle: `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`,
    columnCount: 7,
    logoId,
    blue: COMPANY_COLOR,
    logoAlign: "left",
    singleBlueHeader: true,
  });

  /*
  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = "PAGOS Y ABONOS";
  worksheet.getCell("A1").font = {
    bold: true,
    size: 18,
    color: { argb: WHITE },
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COMPANY_COLOR },
  };

  worksheet.mergeCells("A2:G2");
  worksheet.getCell("A2").value = `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`;
  worksheet.getCell("A2").alignment = { horizontal: "center" };
  worksheet.getCell("A2").font = {
    italic: true,
    color: { argb: COMPANY_COLOR },
  };

  worksheet.addRow([]);
  */

  /*
  worksheet.columns = [
    { key: "nro", width: 8 },
    { key: "nombre", width: 32 },
    { key: "creditoAsignado", width: 18 },
    { key: "cupoOcupado", width: 18 },
    { key: "cupoDisponible", width: 18 },
    { key: "creditosActivos", width: 18 },
    { key: "estado", width: 16 },
  ];
  */

  const headerRow = worksheet.addRow([
    "Documento",
    "Nombre",
    "Crédito Asignado",
    "Cupo Ocupado",
    "Cupo Disponible",
    "Créditos Activos",
    "Estado",
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COMPANY_COLOR },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  accounts.forEach((account, index) => {
    const row = worksheet.addRow({
      documento: account.documento || "-",
      nombre: account.nombre || "Sin nombre",
      creditoAsignado: Number(account.creditoAsignado ?? 0),
      cupoOcupado: Number(account.saldo ?? 0),
      cupoDisponible: Number(account.cupoDisponible ?? 0),
      creditosActivos: Number(account.creditosActivos ?? 0),
      estado: account.estado ?? "al_dia",
    });

    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? WHITE : LIGHT_GRAY },
      };
      cell.border = {
        top: { style: "thin", color: { argb: LIGHT_BLUE } },
        left: { style: "thin", color: { argb: LIGHT_BLUE } },
        bottom: { style: "thin", color: { argb: LIGHT_BLUE } },
        right: { style: "thin", color: { argb: LIGHT_BLUE } },
      };
    });

    ["creditoAsignado", "cupoOcupado", "cupoDisponible"].forEach((key) => {
      row.getCell(key).numFmt = '"$"#,##0';
    });
  });

  worksheet.addRow([]);
  const totalsRow = worksheet.addRow({
    nombre: "TOTALES:",
    creditoAsignado: accounts.reduce((sum, account) => sum + Number(account.creditoAsignado ?? 0), 0),
    cupoOcupado: accounts.reduce((sum, account) => sum + Number(account.saldo ?? 0), 0),
    cupoDisponible: accounts.reduce((sum, account) => sum + Number(account.cupoDisponible ?? 0), 0),
    creditosActivos: accounts.reduce((sum, account) => sum + Number(account.creditosActivos ?? 0), 0),
  });

  totalsRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COMPANY_COLOR } };
    cell.alignment = { vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: LIGHT_BLUE },
    };
    cell.border = {
      top: { style: "thin", color: { argb: COMPANY_COLOR } },
      left: { style: "thin", color: { argb: COMPANY_COLOR } },
      bottom: { style: "thin", color: { argb: COMPANY_COLOR } },
      right: { style: "thin", color: { argb: COMPANY_COLOR } },
    };
  });

  ["creditoAsignado", "cupoOcupado", "cupoDisponible"].forEach((key) => {
    totalsRow.getCell(key).numFmt = '"$"#,##0';
  });

  worksheet.views = [{ state: "frozen", ySplit: 5 }];
  worksheet.autoFilter = { from: "A5", to: "G5" };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `pagos_y_abonos_${fileDate}.xlsx`);

  return true;
};

export const exportAccountsToExcel = async (accounts = []) => {
  if (!accounts.length) return false;

  try {
    const hasInvoiceRows = accounts.some((account) => (account.facturas ?? []).length > 0);
    if (!hasInvoiceRows) return exportAccountsSummaryToExcel(accounts);

    const workbook = await createExcelWorkbook();
    const worksheet = workbook.addWorksheet("Créditos");
    const currentDate = new Date();
    const fileDate = currentDate.toISOString().split("T")[0];
    let rowNumber = 1;

    workbook.creator = "SeymSoft";
    workbook.created = currentDate;

    worksheet.columns = [
      { key: "nro", width: 8 },
      { key: "documento", width: 16 },
      { key: "nombreCliente", width: 26 },
      { key: "nroFactura", width: 14 },
      { key: "valorCredito", width: 16 },
      { key: "interes", width: 14 },
      { key: "totalPagar", width: 16 },
      { key: "fechaCredito", width: 16 },
      { key: "finCredito", width: 16 },
      { key: "abonadoCapital", width: 17 },
      { key: "abonadoInteres", width: 17 },
      { key: "saldoCapital", width: 16 },
      { key: "saldoInteres", width: 16 },
      { key: "saldoTotal", width: 16 },
      { key: "estado", width: 14 },
    ];

    const logoId = await createExcelLogoId(workbook);
    prepareExcelLogoHeader(worksheet, {
      title: "PAGOS Y ABONOS",
      subtitle: `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`,
     columnCount: 15,
     logoId,
     blue: COMPANY_COLOR,
     logoAlign: "left",
     singleBlueHeader: true,
    });

    /*
    worksheet.mergeCells("A1:O1");
    worksheet.getCell("A1").value = "PAGOS Y ABONOS";
    worksheet.getCell("A1").font = {
      bold: true,
      size: 18,
      color: { argb: WHITE },
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COMPANY_COLOR },
    };

    worksheet.mergeCells("A2:O2");
    worksheet.getCell("A2").value = `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`;
    worksheet.getCell("A2").alignment = { horizontal: "center" };
    worksheet.getCell("A2").font = {
      italic: true,
      color: { argb: COMPANY_COLOR },
    };

    worksheet.addRow([]);
    */

    /*
    worksheet.columns = [
      { key: "nro", width: 8 },
      { key: "documento", width: 16 },
      { key: "nombreCliente", width: 26 },
      { key: "nroFactura", width: 14 },
      { key: "valorCredito", width: 16 },
      { key: "interes", width: 14 },
      { key: "totalPagar", width: 16 },
      { key: "fechaCredito", width: 16 },
      { key: "finCredito", width: 16 },
      { key: "abonadoCapital", width: 17 },
      { key: "abonadoInteres", width: 17 },
      { key: "saldoCapital", width: 16 },
      { key: "saldoInteres", width: 16 },
      { key: "saldoTotal", width: 16 },
      { key: "estado", width: 14 },
    ];
    */

    const headerRow = worksheet.addRow([
      "Nro",
      "Documento",
      "Nombre Cliente",
      "Nro Factura",
      "Valor Crédito",
      "Interés",
      "Total a Pagar",
      "Fecha Crédito",
      "Fin de Crédito",
      "Abonado Capital",
      "Abonado Interés",
      "Saldo Capital",
      "Saldo Interés",
      "Saldo Total",
      "Estado",
    ]);

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: WHITE },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COMPANY_COLOR },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const moneyKeys = [
      "valorCredito",
      "interes",
      "totalPagar",
      "abonadoCapital",
      "abonadoInteres",
      "saldoCapital",
      "saldoInteres",
      "saldoTotal",
    ];

    accounts.forEach((cliente) => {
      const facturas = cliente.facturas ?? [];
      facturas.forEach((factura) => {
        const saldoCapital = Math.max(
          0,
          factura.capitalPendiente ??
          ((factura.saldo ?? 0) - (factura.interes ?? 0)),
        );
        const saldoInteres = factura.interesPendiente ?? factura.interes ?? 0;
        const saldoTotal =
          factura.saldoPendiente ??
          factura.deudaTotal ??
          factura.saldo ??
          0;
        const aboCapital = getTotalAbonadoCapital(factura);
        const aboInteres = getTotalAbonadoInteres(factura);
        const estado = factura.estado ?? "al_dia";
        const dueDate = new Date(factura.fechaCredito);
        dueDate.setMonth(dueDate.getMonth() + 2);

        const row = worksheet.addRow({
          nro: rowNumber++,
          documento: cliente.documento,
          nombreCliente: cliente.nombre,
          nroFactura: factura.nroFactura,
          valorCredito: factura.valorCredito ?? 0,
          interes: saldoInteres,
          totalPagar: saldoTotal,
          fechaCredito: factura.fechaCredito,
          finCredito: dueDate.toISOString().split("T")[0],
          abonadoCapital: aboCapital,
          abonadoInteres: aboInteres,
          saldoCapital,
          saldoInteres,
          saldoTotal,
          estado,
        });

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: rowNumber % 2 === 0 ? WHITE : LIGHT_GRAY },
          };
          cell.border = {
            top: { style: "thin", color: { argb: LIGHT_BLUE } },
            left: { style: "thin", color: { argb: LIGHT_BLUE } },
            bottom: { style: "thin", color: { argb: LIGHT_BLUE } },
            right: { style: "thin", color: { argb: LIGHT_BLUE } },
          };
        });

        moneyKeys.forEach((key) => {
          row.getCell(key).numFmt = '"$"#,##0';
        });
      });
    });

    if (rowNumber === 1) return false;

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

    worksheet.addRow([]);
    const totalRow = worksheet.addRow({
      nroFactura: "TOTALES:",
      valorCredito: totCredito,
      interes: totInteres,
      totalPagar: totSaldo,
      saldoTotal: totSaldo,
    });

    totalRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: COMPANY_COLOR },
      };
      cell.alignment = { vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: LIGHT_BLUE },
      };
      cell.border = {
        top: { style: "thin", color: { argb: COMPANY_COLOR } },
        left: { style: "thin", color: { argb: COMPANY_COLOR } },
        bottom: { style: "thin", color: { argb: COMPANY_COLOR } },
        right: { style: "thin", color: { argb: COMPANY_COLOR } },
      };
    });

    moneyKeys.forEach((key) => {
      totalRow.getCell(key).numFmt = '"$"#,##0';
    });

    worksheet.views = [{ state: "frozen", ySplit: 5 }];
    worksheet.autoFilter = { from: "A5", to: "O5" };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `listado_creditos_${fileDate}.xlsx`);

    return true;
  } catch (error) {
    console.error("Error exportando Excel:", error);
    return false;
  }
};
