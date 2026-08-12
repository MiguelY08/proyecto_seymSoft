import horizontalLogoUrl from "../../../assets/PMLogo_Horizontal.png";

const DEFAULT_BLUE = "004D77";
const WHITE = "FFFFFF";

const getColumnLetter = (columnNumber) => {
  let letter = "";
  let number = columnNumber;

  while (number > 0) {
    const remainder = (number - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    number = Math.floor((number - 1) / 26);
  }

  return letter;
};

const getLogoColumnByWidth = (worksheet, columnCount, targetWidth) => {
  const columnWidths = Array.from(
    { length: columnCount },
    (_, index) => worksheet.getColumn(index + 1).width || 10,
  );

  let accumulated = 0;
  for (let index = 0; index < columnWidths.length; index += 1) {
    const width = columnWidths[index];
    if (targetWidth <= accumulated + width) {
      return index + (targetWidth - accumulated) / width;
    }
    accumulated += width;
  }

  return Math.max(0, columnCount - 1);
};

const getCenteredLogoColumn = (worksheet, columnCount, imageWidthPx) => {
  const imageWidthUnits = imageWidthPx / 7;
  const columnWidths = Array.from(
    { length: columnCount },
    (_, index) => worksheet.getColumn(index + 1).width || 10,
  );
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  const calculatedColumn = getLogoColumnByWidth(
    worksheet,
    columnCount,
    Math.max(0, (totalWidth - imageWidthUnits) / 2),
  );

  const visualAdjustment = columnCount <= 4 ? 1.35 : columnCount <= 7 ? 1.05 : 0;
  return Math.min(Math.max(0, columnCount - 1), calculatedColumn + visualAdjustment);
};

export const createExcelLogoId = async (workbook) => {
  if (typeof window === "undefined" || typeof FileReader === "undefined") {
    return null;
  }

  try {
    const response = await fetch(horizontalLogoUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        resolve(result.includes(",") ? result.split(",")[1] : "");
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });

    if (!base64) return null;
    return workbook.addImage({ base64, extension: "png" });
  } catch {
    return null;
  }
};

export const addExcelLogo = (worksheet, logoId, columnCount, options = {}) => {
  if (logoId === null || logoId === undefined) return;

  const width = options.width ?? (columnCount <= 7 ? 235 : 285);
  const height = options.height ?? Math.round(width / 3);

  worksheet.addImage(logoId, {
    tl: {
      col: options.align === "left" ? 0.03 : getCenteredLogoColumn(worksheet, columnCount, width),
      row: options.row ?? 0.05,
    },
    ext: { width, height },
    editAs: "absolute",
  });
};

export const prepareExcelLogoHeader = (
  worksheet,
  {
    title,
    subtitle,
    columnCount,
    logoId,
    blue = DEFAULT_BLUE,
    titleRow = 2,
    subtitleRow = 3,
    spacer = true,
    logoAlign = "center",
    singleBlueHeader = false,
  },
) => {
  const lastColumn = getColumnLetter(columnCount);

  if (singleBlueHeader) {
    worksheet.getRow(1).height = 52;
    for (let index = 1; index <= columnCount; index += 1) {
      const cell = worksheet.getCell(`${getColumnLetter(index)}1`);
      cell.value = null;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: blue } };
      cell.border = {
        top: { style: "thin", color: { argb: blue } },
        left: { style: "thin", color: { argb: blue } },
        bottom: { style: "thin", color: { argb: blue } },
        right: { style: "thin", color: { argb: blue } },
      };
    }

    worksheet.mergeCells(`A1:${lastColumn}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { bold: true, size: 18, color: { argb: WHITE } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: blue } };

    addExcelLogo(worksheet, logoId, columnCount, {
      align: logoAlign,
      width: 205,
      height: 70,
      row: 0.02,
    });

    worksheet.mergeCells(`A2:${lastColumn}2`);
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = subtitle;
    subtitleCell.font = { italic: true, color: { argb: blue } };
    subtitleCell.alignment = { horizontal: "center" };
    worksheet.getRow(2).height = 24;

    if (spacer) {
      worksheet.addRow([]);
      worksheet.addRow([]);
    }

    return {
      lastColumn,
      headerRowNumber: spacer ? 5 : 3,
    };
  }

  worksheet.getRow(1).height = 60;
  for (let index = 1; index <= columnCount; index += 1) {
    const cell = worksheet.getCell(`${getColumnLetter(index)}1`);
    cell.value = null;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: blue } };
    cell.border = {
      top: { style: "thin", color: { argb: blue } },
      left: { style: "thin", color: { argb: blue } },
      bottom: { style: "thin", color: { argb: blue } },
      right: { style: "thin", color: { argb: blue } },
    };
  }

  addExcelLogo(worksheet, logoId, columnCount, { align: logoAlign });

  worksheet.mergeCells(`A${titleRow}:${lastColumn}${titleRow}`);
  const titleCell = worksheet.getCell(`A${titleRow}`);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 18, color: { argb: WHITE } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: blue } };
  worksheet.getRow(titleRow).height = 34;

  worksheet.mergeCells(`A${subtitleRow}:${lastColumn}${subtitleRow}`);
  const subtitleCell = worksheet.getCell(`A${subtitleRow}`);
  subtitleCell.value = subtitle;
  subtitleCell.font = { italic: true, color: { argb: blue } };
  subtitleCell.alignment = { horizontal: "center" };
  worksheet.getRow(subtitleRow).height = 24;

  if (spacer) worksheet.addRow([]);

  return {
    lastColumn,
    headerRowNumber: spacer ? subtitleRow + 2 : subtitleRow + 1,
  };
};
