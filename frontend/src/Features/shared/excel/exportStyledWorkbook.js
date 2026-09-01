import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { createExcelLogoId, prepareExcelLogoHeader } from "./logoHeader";

const COMPANY_COLOR = "004D77";
const LIGHT_BLUE = "DCEBF3";
const LIGHT_GRAY = "F3F4F6";
const WHITE = "FFFFFF";
const CURRENCY_FORMAT = '"$"#,##0';

const styleHeaderRow = (row) => {
  row.height = 22;
  row.eachCell((cell) => {
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
};

const styleDataRow = (row, index) => {
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
};

const addSheet = (workbook, sheet, subtitle, logoId, workbookTitle) => {
  const worksheet = workbook.addWorksheet(sheet.name);
  const lastColumn = String.fromCharCode(64 + sheet.columns.length);

  worksheet.columns = sheet.columns;
  prepareExcelLogoHeader(worksheet, {
    title: sheet.title || workbookTitle || sheet.name,
    subtitle,
    columnCount: sheet.columns.length,
    logoId,
    blue: COMPANY_COLOR,
    logoAlign: "left",
    singleBlueHeader: true,
  });

  const headerRow = worksheet.addRow(sheet.columns.map((column) => column.header));
  styleHeaderRow(headerRow);

  sheet.rows.forEach((data, index) => {
    const row = worksheet.addRow(data);
    if (!sheet.currencyRows || sheet.currencyRows.includes(index)) {
      (sheet.currencyColumns ?? []).forEach((key) => {
        row.getCell(key).numFmt = CURRENCY_FORMAT;
      });
    }
    styleDataRow(row, index);
  });

  worksheet.views = [{ state: "frozen", ySplit: 5 }];
  worksheet.autoFilter = { from: "A5", to: `${lastColumn}5` };
};

export const exportStyledWorkbook = async ({
  fileName,
  sheets,
  subtitle,
  title,
}) => {
  const workbook = new ExcelJS.Workbook();
  const currentDate = new Date();

  workbook.creator = "SeymSoft";
  workbook.created = currentDate;
  const logoId = await createExcelLogoId(workbook);
  sheets.forEach((sheet) => addSheet(workbook, sheet, subtitle, logoId, title));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};
