import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, HelpCircle, X } from 'lucide-react';
import DOMPurify from 'dompurify';

const DEFAULT_TIMER = 4000;
const bgAlert = 'bg-white';

const variants = {
  success: {
    bg:       bgAlert,
    border:   'border-green-100',
    iconBg:   'bg-green-50 ring-green-100',
    title:    'text-green-900',
    text:     'text-green-600',
    timerBar: 'bg-green-500',
    icon:     <CheckCircle className="w-6 h-6 text-green-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-green-500 hover:bg-green-600 text-white',
    cancel:   'bg-white border border-green-300 text-green-600 hover:bg-green-100',
    close:    'text-green-500 hover:text-green-700 hover:bg-green-50',
  },
  error: {
    bg:       bgAlert,
    border:   'border-red-100',
    iconBg:   'bg-red-50 ring-red-100',
    title:    'text-red-900',
    text:     'text-red-600',
    timerBar: 'bg-red-400',
    icon:     <XCircle className="w-6 h-6 text-red-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-red-500 hover:bg-red-600 text-white',
    cancel:   'bg-white border border-red-300 text-red-500 hover:bg-red-100',
    close:    'text-red-500 hover:text-red-700 hover:bg-red-50',
  },
  warning: {
    bg:       bgAlert,
    border:   'border-yellow-100',
    iconBg:   'bg-yellow-50 ring-yellow-100',
    title:    'text-yellow-900',
    text:     'text-yellow-700',
    timerBar: 'bg-yellow-400',
    icon:     <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-yellow-500 hover:bg-yellow-600 text-white',
    cancel:   'bg-white border border-yellow-300 text-yellow-600 hover:bg-yellow-100',
    close:    'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50',
  },
  info: {
    bg:       bgAlert,
    border:   'border-blue-100',
    iconBg:   'bg-blue-50 ring-blue-100',
    title:    'text-blue-900',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    icon:     <Info className="w-6 h-6 text-blue-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-100',
    close:    'text-blue-500 hover:text-blue-700 hover:bg-blue-50',
  },
  question: {
    bg:       bgAlert,
    border:   'border-blue-100',
    iconBg:   'bg-[#e8f4fd] ring-[#cfe4f0]',
    title:    'text-blue-900',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    icon:     <HelpCircle className="w-6 h-6 text-blue-500 shrink-0" strokeWidth={2} />,
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-100',
    close:    'text-blue-500 hover:text-blue-700 hover:bg-blue-50',
  },
  plain: {
    bg:       bgAlert,
    border:   'border-slate-200',
    iconBg:   'bg-[#e8f4fd] ring-[#cfe4f0]',
    title:    'text-blue-900',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    icon:     null,
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-100',
    close:    'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
  },
};

// Animaciones igual que antes
const motionClass = (position, visible) => {
  if (position === 'right') {
    return visible
      ? 'opacity-100 translate-x-0 translate-y-0'
      : 'opacity-0 -translate-y-3 sm:translate-x-10 sm:translate-y-0';
  }
  return visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 -translate-y-4';
};

function AlertItem({ alert, onRemove, position = 'center' }) {
  const { id, type, title, text, isConfirm, confirmButtonText, cancelButtonText, timer, resolve, html, didOpen, showCloseButton } = alert;
  const v = variants[type] ?? variants.info;
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';

    return DOMPurify.sanitize(String(html), {
      ALLOWED_TAGS: [
        'a',
        'b',
        'br',
        'em',
        'i',
        'li',
        'ol',
        'p',
        'small',
        'span',
        'strong',
        'u',
        'ul',
      ],
      ALLOWED_ATTR: ['href', 'rel', 'target', 'title'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    });
  }, [html]);

  const effectiveTimer = isConfirm ? null : (timer ?? DEFAULT_TIMER);

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      resolve?.({ isConfirmed: false, isDismissed: true });
      onRemove(id);
    }, 300);
  }, [id, onRemove, resolve]);

  // Efecto de entrada
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Callback didOpen
  useEffect(() => {
    if (visible && didOpen) didOpen();
  }, [visible, didOpen]);

  // Timer (solo barra, sin segundos)
  useEffect(() => {
    if (!effectiveTimer) return;
    const interval = 50;
    const decrement = 100 / (effectiveTimer / interval);
    let current = 100;

    const tick = setInterval(() => {
      current -= decrement;
      setProgress(Math.max(current, 0));
      if (current <= 0) {
        clearInterval(tick);
        handleClose();
      }
    }, interval);

    return () => clearInterval(tick);
  }, [effectiveTimer, handleClose]);

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
      resolve?.({ isConfirmed: false, isDismissed: false });
      onRemove(id);
    }, 300);
  };

  return (
    <div
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl border shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.02] transition-all duration-300 sm:rounded-2xl ${v.bg} ${v.border} ${motionClass(position, visible)}`}
      role={isConfirm ? 'dialog' : 'alert'}
      aria-live={isConfirm ? 'assertive' : 'polite'}
      aria-modal={isConfirm ? 'false' : undefined}
      aria-labelledby={`alert-title-${id}`}
      aria-describedby={text || html ? `alert-message-${id}` : undefined}
    >
      {/* Contenido principal con botón de cierre (solo si no es confirmación) */}
      <div className="flex max-h-[70vh] items-start gap-2.5 overflow-y-auto px-3.5 py-3 sm:gap-3 sm:px-4 sm:py-4">
        {v.icon && (
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 sm:h-9 sm:w-9 ${v.iconBg} [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6`}>
            {v.icon}
          </div>
        )}
        <div className="min-w-0 flex-1 break-words">
          <p id={`alert-title-${id}`} className={`text-sm font-semibold leading-snug [overflow-wrap:anywhere] sm:text-base ${v.title}`}>{title}</p>
          {text && <p id={`alert-message-${id}`} className={`mt-1 whitespace-pre-line text-xs leading-relaxed [overflow-wrap:anywhere] sm:text-sm ${v.text}`}>{text}</p>}
          {sanitizedHtml && (
            <p id={`alert-message-${id}`} className={`mt-1 text-xs leading-relaxed [overflow-wrap:anywhere] sm:text-sm ${v.text}`} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          )}
        </div>
        {(!isConfirm || showCloseButton) && (
          <button
            onClick={handleClose}
            className={`rounded-full p-1 -mr-1 -mt-1 transition-colors duration-200 cursor-pointer ${v.close}`}
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Botones de confirmación (isConfirm) */}
      {isConfirm && (
        <div className="flex flex-col gap-2 px-3.5 pb-3.5 sm:flex-row sm:items-center sm:px-4 sm:pb-4">
          <button
            onClick={handleConfirm}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-snug transition-all duration-200 cursor-pointer sm:min-h-10 sm:rounded-lg sm:py-2 ${v.confirm}`}
          >
            {confirmButtonText}
          </button>
          <button
            onClick={handleCancel}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-snug transition-all duration-200 cursor-pointer sm:min-h-10 sm:rounded-lg sm:py-2 ${v.cancel}`}
          >
            {cancelButtonText}
          </button>
        </div>
      )}

      {/* Barra de progreso (sin contador de segundos) */}
      {effectiveTimer && (
        <div className="px-3.5 pb-2.5 sm:px-4 sm:pb-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-none ${v.timerBar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertItem;
