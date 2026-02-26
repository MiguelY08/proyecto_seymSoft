import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const DEFAULT_TIMER = 4000;

const variants = {
  success: {
    bg:       'bg-green-50',
    border:   'border-green-300',
    title:    'text-green-800',
    text:     'text-green-600',
    timerBar: 'bg-green-500',
    icon:     <CheckCircle className="w-6 h-6 text-green-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-green-500 hover:bg-green-600 text-white',
    cancel:   'bg-white border border-green-300 text-green-600 hover:bg-green-50',
  },
  error: {
    bg:       'bg-red-50',
    border:   'border-red-300',
    title:    'text-red-800',
    text:     'text-red-600',
    timerBar: 'bg-red-400',
    icon:     <XCircle className="w-6 h-6 text-red-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-red-500 hover:bg-red-600 text-white',
    cancel:   'bg-white border border-red-300 text-red-500 hover:bg-red-50',
  },
  warning: {
    bg:       'bg-yellow-50',
    border:   'border-yellow-300',
    title:    'text-yellow-800',
    text:     'text-yellow-700',
    timerBar: 'bg-yellow-400',
    icon:     <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-yellow-500 hover:bg-yellow-600 text-white',
    cancel:   'bg-white border border-yellow-300 text-yellow-600 hover:bg-yellow-50',
  },
  info: {
    bg:       'bg-blue-50',
    border:   'border-blue-300',
    title:    'text-blue-800',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    icon:     <Info className="w-6 h-6 text-blue-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-50',
  },
  question: {
    bg:       'bg-blue-50',
    border:   'border-blue-300',
    title:    'text-blue-800',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    icon:     <HelpCircle className="w-6 h-6 text-blue-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-50',
  },
  plain: {
    bg:       'bg-blue-50',
    border:   'border-blue-300',
    title:    'text-blue-800',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    icon:     null,
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-50',
  },
};

// ─── Clases de animación según posición ───────────────────────────────────────
const motionClass = (position, visible) => {
  if (position === 'right') {
    return visible
      ? 'opacity-100 translate-x-0'
      : 'opacity-0 translate-x-10';
  }
  // center
  return visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 -translate-y-4';
};

function AlertItem({ alert, onRemove, position = 'center' }) {
  const { id, type, title, text, isConfirm, confirmButtonText, cancelButtonText, timer, resolve, html, didOpen } = alert;
  const v = variants[type] ?? variants.info;

  const effectiveTimer = isConfirm ? null : (timer ?? DEFAULT_TIMER);

  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible && didOpen) didOpen();
  }, [visible, didOpen]);

  useEffect(() => {
    if (!effectiveTimer) return;
    const interval  = 50;
    const decrement = 100 / (effectiveTimer / interval);
    let current     = 100;

    const tick = setInterval(() => {
      current -= decrement;
      setProgress(Math.max(current, 0));
      if (current <= 0) {
        clearInterval(tick);
        handleClose();
      }
    }, interval);

    return () => clearInterval(tick);
  }, [effectiveTimer]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      resolve?.({ isConfirmed: false, isDismissed: true });
      onRemove(id);
    }, 300);
  };

  const handleConfirm = () => {
    setVisible(false);
    setTimeout(() => {
      resolve?.({ isConfirmed: true, isDismissed: false });
      onRemove(id);
    }, 300);
  };

  const handleCancel = () => {
    setVisible(false);
    setTimeout(() => {
      resolve?.({ isConfirmed: false, isDismissed: true });
      onRemove(id);
    }, 300);
  };

  return (
    <div
      className={`pointer-events-auto w-full rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 ${v.bg} ${v.border} ${motionClass(position, visible)}`}
      onClick={!isConfirm ? handleClose : undefined}
    >
      {/* ─── Contenido ──────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {v.icon && <div className="mt-0.5">{v.icon}</div>}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold uppercase tracking-wide ${v.title}`}>{title}</p>
          {text && <p className={`text-xs mt-0.5 ${v.text}`}>{text}</p>}
          {html && (
            <p className={`text-xs mt-0.5 ${v.text}`} dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>

      {/* ─── Botones de confirmación ─────────────────────────────────────── */}
      {isConfirm && (
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${v.confirm}`}
          >
            {confirmButtonText}
          </button>
          <button
            onClick={handleCancel}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${v.cancel}`}
          >
            {cancelButtonText}
          </button>
        </div>
      )}

      {/* ─── Barra de timer ──────────────────────────────────────────────── */}
      {effectiveTimer && (
        <div className="h-1 w-full bg-black/10">
          <div className={`h-full transition-none ${v.timerBar}`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export default AlertItem;