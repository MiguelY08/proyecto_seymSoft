import React, { useEffect, useRef, useState } from 'react';
import ScannerStatus from './ScannerStatus';
import { useBarcodeScanner } from './useBarcodeScanner';

function ScannerInput(
  {
    value,
    onChange,
    onFocus,
    onBlur,
    onScan,
    onInvalidScan,
    onDuplicateScan,
    scannerField = 'barcode-input',
    enabledOnFocus = true,
    numericOnly = true,
    minLength = 6,
    maxLength = 20,
    preventDefault = true,
    duplicateDelayMs = 800,
    className = '',
    inputClassName = '',
    statusClassName = '',
    ...rest
  },
  forwardedRef
) {
  const [isFocused, setIsFocused] = useState(false);
  const [scannerStatus, setScannerStatus] = useState(null);
  const internalRef = useRef(null);
  const ref = forwardedRef ?? internalRef;

  useBarcodeScanner({
    enabled: enabledOnFocus ? isFocused : true,
    numericOnly,
    minLength,
    maxLength,
    scannerFields: [scannerField],
    duplicateDelayMs,
    preventDefault,
    onScan: (payload) => {
      setScannerStatus({ type: 'success', message: `Escaneado: ${payload.code}` });
      onScan?.(payload);
    },
    onInvalidScan: (payload) => {
      setScannerStatus({ type: 'error', message: `Escaneo inválido` });
      onInvalidScan?.(payload);
    },
    onDuplicateScan: (payload) => {
      setScannerStatus({ type: 'info', message: `Escaneo duplicado` });
      onDuplicateScan?.(payload);
    },
  });

  useEffect(() => {
    if (!scannerStatus) return undefined;

    const timeout = window.setTimeout(() => {
      setScannerStatus(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [scannerStatus]);

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <div className={className}>
      <input
        {...rest}
        ref={ref}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-scanner-field={scannerField}
        className={inputClassName}
      />
      <ScannerStatus status={scannerStatus} className={statusClassName} />
    </div>
  );
}

export default React.forwardRef(ScannerInput);
