import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  CreditCard,
  Package,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  User,
  Users,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const typeIconMap = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  sale: ShoppingBag,
  purchase: Package,
  payment: CreditCard,
  stock: Warehouse,
  credit: CreditCard,
  order: ShoppingBag,
  user: User,
  role: Users,
  security: ShieldAlert,
  system: Bell,
  info: Bell,
};

const typeColorMap = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-600",
  security: "bg-red-50 text-red-600",
  payment: "bg-sky-50 text-sky-600",
  credit: "bg-sky-50 text-sky-600",
  stock: "bg-orange-50 text-orange-600",
  sale: "bg-indigo-50 text-indigo-600",
  purchase: "bg-violet-50 text-violet-600",
  order: "bg-indigo-50 text-indigo-600",
  user: "bg-teal-50 text-teal-600",
  role: "bg-teal-50 text-teal-600",
  system: "bg-slate-100 text-slate-600",
  info: "bg-blue-50 text-blue-600",
};

const formatDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIconMap[notification.type] || Bell;
  const iconColor = typeColorMap[notification.type] || typeColorMap.info;
  const longMessage = notification.metadata?.longMessage || notification.metadata?.detailMessage || "";
  const canReadMore = Boolean(longMessage) || String(notification.message || "").length > 95;
  const visibleMessage = expanded && longMessage ? longMessage : notification.message;

  const handleOpen = async () => {
    if (!notification.isRead) {
      await onMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      onClose?.();
      navigate(notification.actionUrl);
    }
  };

  return (
    <article
      className={`group flex min-w-0 gap-2.5 border-b border-slate-100 px-3 py-2.5 transition-colors hover:bg-slate-50 sm:gap-3 sm:px-4 sm:py-3 ${
        notification.isRead ? "bg-white" : "bg-[#004D77]/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="flex min-w-0 flex-1 gap-2.5 text-left sm:gap-3"
      >
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${iconColor}`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="line-clamp-1 min-w-0 break-words text-sm font-semibold text-[#004D77] [overflow-wrap:anywhere]">
              {notification.title}
            </span>
            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            )}
          </span>
          <span className={`mt-1 min-w-0 break-words text-xs leading-5 text-slate-600 [overflow-wrap:anywhere] ${expanded ? "" : "line-clamp-2"}`}>
            {visibleMessage}
          </span>
          {canReadMore && (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((current) => !current);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setExpanded((current) => !current);
                }
              }}
              className="mt-1 inline-flex text-[11px] font-semibold text-[#004D77] hover:underline"
            >
              {expanded ? "Leer menos" : "Leer más"}
            </span>
          )}
          <span className="mt-1 block text-[11px] font-medium text-slate-400">
            {formatDate(notification.createdAt)}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 flex-col gap-0.5 opacity-100 sm:gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        {!notification.isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 sm:p-1.5"
            aria-label="Marcar como leida"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 sm:p-1.5"
          aria-label="Eliminar notificacion"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default NotificationItem;
