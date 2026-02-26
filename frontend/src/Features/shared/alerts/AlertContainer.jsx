import { createPortal } from 'react-dom';
import AlertItem from './AlertItem';

// ─── Alta importancia: confirmaciones y advertencias → centro superior ────────
const HIGH_IMPORTANCE = (alert) => alert.isConfirm || alert.type === 'warning';

function AlertContainer({ alerts, onRemove }) {
  const centerAlerts = alerts.filter((a) =>  HIGH_IMPORTANCE(a));
  const rightAlerts  = alerts.filter((a) => !HIGH_IMPORTANCE(a));

  return createPortal(
    <>
      {/* ── Centro superior ───────────────────────────────────────────────── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-3 w-full max-w-sm sm:max-w-md px-4 pointer-events-none">
        {centerAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onRemove={onRemove} position="center" />
        ))}
      </div>

      {/* ── Derecha superior ──────────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-9999 flex flex-col items-end gap-3 w-full max-w-xs pointer-events-none">
        {rightAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onRemove={onRemove} position="right" />
        ))}
      </div>
    </>,
    document.body
  );
}

export default AlertContainer;