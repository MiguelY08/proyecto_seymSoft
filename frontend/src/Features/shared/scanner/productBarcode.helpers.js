import { normalizeBarcode } from './scanner.helpers';

const getProductIdentity = (product = {}) => product.id ?? product.idProduct ?? null;

const sameProductIdentity = (left, right) => {
  if (left === undefined || left === null || right === undefined || right === null) return false;
  return String(left) === String(right);
};

export const getProductBarcodeValues = (product = {}) => {
  const directValues = [
    product.codBarras,
    product.codigoBarras,
    product.barcode,
    product.mainBarcode,
  ];
  const barcodeCollections = [
    product.barcodes,
    product.productBarcodes,
    product.codigosExtra,
    product.extraBarcodes,
  ];

  const nestedValues = barcodeCollections.flatMap((collection) => (
    Array.isArray(collection)
      ? collection.flatMap((item) => {
          if (typeof item === 'string' || typeof item === 'number') return [item];

          return [
            item?.barcode,
            item?.codBarras,
            item?.codigoBarras,
            item?.code,
            item?.cod,
            item?.value,
          ];
        })
      : []
  ));

  return [...directValues, ...nestedValues]
    .map((value) => normalizeBarcode(value))
    .filter(Boolean);
};

export const getPrimaryProductBarcode = (product = {}) =>
  getProductBarcodeValues(product)[0] ?? '';

export const findProductByBarcode = (products = [], code) => {
  const normalizedCode = normalizeBarcode(code);
  if (!normalizedCode) return null;

  return products.find((product) =>
    getProductBarcodeValues(product).some((barcode) => barcode === normalizedCode)
  ) ?? null;
};

export const productMatchesBarcodeSearch = (product = {}, searchTerm = '') => {
  const normalizedTerm = normalizeBarcode(searchTerm);
  if (!normalizedTerm) return false;

  return getProductBarcodeValues(product).some((barcode) =>
    barcode.toLowerCase().includes(normalizedTerm.toLowerCase())
  );
};

export const getProductBarcodeOwners = (products = []) =>
  products.flatMap((product) => {
    const productId = getProductIdentity(product);
    const productName = product.name ?? product.nombre ?? '';

    return getProductBarcodeValues(product).map((barcode) => ({
      barcode,
      product,
      productId,
      productName,
    }));
  });

export const findProductBarcodeOwner = (products = [], code, options = {}) => {
  const normalizedCode = normalizeBarcode(code);
  if (!normalizedCode) return null;

  return getProductBarcodeOwners(products).find((owner) => {
    if (owner.barcode !== normalizedCode) return false;
    if (sameProductIdentity(owner.productId, options.excludeProductId)) return false;
    return true;
  }) ?? null;
};

export const hasProductBarcodeOwner = (products = [], code, options = {}) =>
  Boolean(findProductBarcodeOwner(products, code, options));

export const getDuplicateBarcodesInValues = (values = []) => {
  const counts = values.reduce((acc, value) => {
    const barcode = normalizeBarcode(value);
    if (!barcode) return acc;
    acc.set(barcode, (acc.get(barcode) ?? 0) + 1);
    return acc;
  }, new Map());

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([barcode]) => barcode);
};

export const hasDuplicateBarcodesInValues = (values = []) =>
  getDuplicateBarcodesInValues(values).length > 0;
