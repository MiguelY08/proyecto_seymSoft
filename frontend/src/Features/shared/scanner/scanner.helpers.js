export const DEFAULT_SCANNER_OPTIONS = {
  minLength: 8,
  maxLength: 32,
  maxIntervalMs: 55,
  finishDelayMs: 90,
  duplicateDelayMs: 500,
  terminatorKeys: ['Enter', 'Tab'],
  allowedPattern: /^[0-9A-Za-z._-]$/,
  numericOnly: false,
  preventDefault: false,
  preventTerminatorDefault: false,
  scannerFields: null,
};

export const isEditableScannerTarget = (target) => {
  if (!target || typeof target.closest !== 'function') return false;

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
  );
};

const SCANNER_TARGET_SELECTOR =
  '[data-scanner-field], [data-scanner-capture="true"], .availableForScanning, #availableForScanning';

export const isScannerTarget = (target) => {
  if (!target || typeof target.closest !== 'function') return false;

  return Boolean(target.closest(SCANNER_TARGET_SELECTOR));
};

export const getScannerField = (target) => {
  if (!target || typeof target.closest !== 'function') return '';

  const scannerField = target.closest('[data-scanner-field]');
  return scannerField?.dataset?.scannerField ?? '';
};

export const hasScannerField = (target) => Boolean(getScannerField(target) || isScannerTarget(target));

export const shouldCaptureScannerEvent = (event, options = {}) => {
  if (!event || event.isComposing) return false;
  if (event.ctrlKey || event.altKey || event.metaKey) return false;

  const config = { ...DEFAULT_SCANNER_OPTIONS, ...options };
  const isTerminator = config.terminatorKeys.includes(event.key);
  const isAllowedChar = event.key.length === 1 && config.allowedPattern.test(event.key);
  const scannerField = getScannerField(event.target);
  const hasAllowedScannerFields = Array.isArray(config.scannerFields) && config.scannerFields.length > 0;
  const hasScannerTarget = isScannerTarget(event.target);

  if (!isTerminator && !isAllowedChar) return false;
  if (hasAllowedScannerFields) return Boolean(scannerField && config.scannerFields.includes(scannerField)) || hasScannerTarget;
  if (config.captureInInputs) return true;
  if (hasScannerTarget) return true;

  return !isEditableScannerTarget(event.target);
};

export const normalizeBarcode = (value, options = {}) => {
  const config = { ...DEFAULT_SCANNER_OPTIONS, ...options };
  const text = String(value ?? '').trim();
  const compact = text.replace(/\s+/g, '');

  if (config.numericOnly) {
    return compact.replace(/\D/g, '');
  }

  return Array.from(compact)
    .filter((char) => config.allowedPattern.test(char))
    .join('');
};

export const isValidBarcode = (value, options = {}) => {
  const config = { ...DEFAULT_SCANNER_OPTIONS, ...options };
  const code = normalizeBarcode(value, config);

  if (code.length < config.minLength) return false;
  if (code.length > config.maxLength) return false;
  if (typeof config.validate === 'function') return Boolean(config.validate(code));

  return true;
};

export const buildScannerPayload = ({
  code,
  raw,
  startedAt,
  endedAt,
  endedBy,
  event,
  target,
  scannerField,
}) => ({
  code,
  raw,
  startedAt,
  endedAt,
  durationMs: Math.max(0, endedAt - startedAt),
  endedBy,
  event,
  target,
  scannerField,
});
