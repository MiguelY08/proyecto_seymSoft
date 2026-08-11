import { createPortal } from 'react-dom';
import AlertItem from './AlertItem';

// ─── Alta importancia: confirmaciones y advertencias → centro superior ────────
const HIGH_IMPORTANCE = (alert) => alert.isConfirm || alert.type === 'warning';

function AlertContainer({ alerts, onRemove }) {
  // El estado ya llega limitado desde AlertContext; aqui solo invertimos el orden visual.
  const visibleAlerts = alerts.slice().reverse();

  const centerAlerts = visibleAlerts.filter((a) => HIGH_IMPORTANCE(a));
  const rightAlerts = visibleAlerts.filter((a) => !HIGH_IMPORTANCE(a));

  return createPortal(
    <>
      {/* ── Centro superior ───────────────────────────────────────────────── */}
      <div className="fixed left-3 right-3 top-3 z-[9999] flex flex-col items-center gap-2 pointer-events-none sm:left-1/2 sm:right-auto sm:top-4 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:gap-3 sm:px-4">
        {centerAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onRemove={onRemove} position="center" />
        ))}
      </div>

      {/* ── Derecha superior ──────────────────────────────────────────────── */}
      <div className="fixed left-3 right-3 top-3 z-[9999] flex flex-col items-stretch gap-2 pointer-events-none sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-xs sm:items-end sm:gap-3">
        {rightAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onRemove={onRemove} position="right" />
        ))}
      </div>
    </>,
    document.body
  );
}

export default AlertContainer;
