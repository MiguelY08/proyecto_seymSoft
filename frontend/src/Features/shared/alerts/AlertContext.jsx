import { createContext, useState, useCallback } from 'react';
import AlertContainer from './AlertContainer';

export const AlertContext = createContext(null);

let alertId = 0;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const remove = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ─── Alerta base interna ──────────────────────────────────────────────────
  const push = useCallback((config) => {
    const id = ++alertId;
    return new Promise((resolve) => {
      setAlerts((prev) => [...prev, { ...config, id, resolve }]);
    });
  }, []);

  // ─── Alertas simples ──────────────────────────────────────────────────────
  const showError   = useCallback((title, text, extra = {}) => push({ type: 'error',   title, text, ...extra }), [push]);
  const showWarning = useCallback((title, text, extra = {}) => push({ type: 'warning', title, text, ...extra }), [push]);
  const showSuccess = useCallback((title, text, extra = {}) => push({ type: 'success', title, text, ...extra }), [push]);
  const showInfo    = useCallback((title, text, extra = {}) => push({ type: 'info',    title, text, ...extra }), [push]);

  // ─── Alerta de confirmación ───────────────────────────────────────────────
  const showConfirm = useCallback((type, title, text, extra = {}) =>
    push({
      type,
      title,
      text,
      isConfirm:         true,
      confirmButtonText: extra.confirmButtonText ?? 'Confirmar',
      cancelButtonText:  extra.cancelButtonText  ?? 'Cancelar',
      ...extra,
    }), [push]);

  // ─── Alerta con timer ─────────────────────────────────────────────────────
  const showTimer = useCallback((type, title, text, ms = 5000, extra = {}) =>
    push({
      type,
      title,
      text,
      timer: ms,
      ...extra,
    }), [push]);

  // ─── Alerta sin icono ─────────────────────────────────────────────────────
  const showPlain = useCallback((title, text, extra = {}) =>
    push({ type: 'plain', title, text, ...extra }), [push]);

  return (
    <AlertContext.Provider value={{ showError, showWarning, showSuccess, showInfo, showConfirm, showTimer, showPlain }}>
      {children}
      <AlertContainer alerts={alerts} onRemove={remove} />
    </AlertContext.Provider>
  );
}