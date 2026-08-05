import { useEffect, useRef } from 'react';
import {
  DEFAULT_SCANNER_OPTIONS,
  buildScannerPayload,
  getScannerField,
  isScannerTarget,
  isEditableScannerTarget,
  normalizeBarcode,
  shouldCaptureScannerEvent,
} from './scanner.helpers';

const createEmptyBuffer = () => ({
  chars: [],
  startedAt: 0,
  lastAt: 0,
  target: null,
  scannerField: '',
  isUnauthorizedTarget: false,
  isScannerCandidate: false,
  initialValue: null,
  initialSelectionStart: null,
  initialSelectionEnd: null,
});

export function useBarcodeScanner(options = {}) {
  const optionsRef = useRef(options);
  const bufferRef = useRef(createEmptyBuffer());
  const timeoutRef = useRef(null);
  const lastScanRef = useRef({ code: '', at: 0 });

  optionsRef.current = options;

  useEffect(() => {
    const clearFinishTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const resetBuffer = () => {
      bufferRef.current = createEmptyBuffer();
      clearFinishTimer();
    };

    const flushBuffer = (endedBy, event = null) => {
      const config = { ...DEFAULT_SCANNER_OPTIONS, ...optionsRef.current };
      const buffer = bufferRef.current;
      const raw = buffer.chars.join('');

      resetBuffer();
      if (!raw) return;

      const endedAt = Date.now();
      const code = normalizeBarcode(raw, config);
      const isLengthValid = code.length >= config.minLength && code.length <= config.maxLength;
      const isCustomValid = typeof config.validate === 'function' ? Boolean(config.validate(code)) : true;

      if (buffer.isUnauthorizedTarget && buffer.target) {
        // En campos no autorizados, evitamos que el escaneo deje texto.
        buffer.target?.setSelectionRange?.(
          buffer.initialSelectionStart,
          buffer.initialSelectionEnd
        );
        if (buffer.target?.value !== buffer.initialValue) {
          buffer.target.value = buffer.initialValue ?? '';
        }
      }

      if (!isLengthValid || !isCustomValid) {
        optionsRef.current.onInvalidScan?.({
          code,
          raw,
          reason: !isLengthValid ? 'length' : 'validate',
          endedBy,
          event,
          target: buffer.target,
          scannerField: buffer.scannerField,
        });
        return;
      }

      if (
        config.duplicateDelayMs > 0 &&
        lastScanRef.current.code === code &&
        endedAt - lastScanRef.current.at < config.duplicateDelayMs
      ) {
        optionsRef.current.onDuplicateScan?.({
          code,
          raw,
          endedBy,
          event,
          target: buffer.target,
          scannerField: buffer.scannerField,
        });
        return;
      }

      lastScanRef.current = { code, at: endedAt };
      optionsRef.current.onScan?.(
        buildScannerPayload({
          code,
          raw,
          startedAt: buffer.startedAt || endedAt,
          endedAt,
          endedBy,
          event,
          target: buffer.target,
          scannerField: buffer.scannerField,
        })
      );
    };

    const handleKeyDown = (event) => {
      const config = { ...DEFAULT_SCANNER_OPTIONS, ...optionsRef.current };
      if (config.enabled === false) return;
      if (!shouldCaptureScannerEvent(event, config)) return;

      const now = Date.now();
      const isTerminator = config.terminatorKeys.includes(event.key);
      const buffer = bufferRef.current;
      const target = event.target;
      const isScannerCandidate = isScannerTarget(target);
      const isEditable = isEditableScannerTarget(target);

      if (buffer.chars.length === 0) {
        buffer.isScannerCandidate = isScannerCandidate;
        buffer.isUnauthorizedTarget = isEditable && !isScannerCandidate;
        buffer.initialValue = target?.value ?? null;
        buffer.initialSelectionStart = target?.selectionStart ?? null;
        buffer.initialSelectionEnd = target?.selectionEnd ?? null;
      }

      if (isTerminator) {
        if (buffer.chars.length > 0) {
          if (buffer.isUnauthorizedTarget || config.preventDefault === true || config.preventTerminatorDefault === true) {
            event.preventDefault();
          }
          flushBuffer(event.key, event);
        }
        return;
      }

      if (buffer.lastAt && now - buffer.lastAt > config.maxIntervalMs) {
        resetBuffer();
      }

      const nextBuffer = bufferRef.current;
      if (nextBuffer.chars.length === 0) {
        nextBuffer.startedAt = now;
        nextBuffer.target = target;
        nextBuffer.scannerField = getScannerField(target);
      }
      nextBuffer.chars.push(event.key);
      nextBuffer.lastAt = now;

      if (buffer.isUnauthorizedTarget || config.preventDefault === true) {
        event.preventDefault();
      }

      clearFinishTimer();
      timeoutRef.current = window.setTimeout(() => {
        flushBuffer('timeout');
      }, config.finishDelayMs);
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      clearFinishTimer();
    };
  }, []);
}
