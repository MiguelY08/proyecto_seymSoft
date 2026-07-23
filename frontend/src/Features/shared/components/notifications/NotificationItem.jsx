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
  const Icon = typeIconMap[notification.type] || Bell;
  const iconColor = typeColorMap[notification.type] || typeColorMap.info;

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
      className={`group flex gap-3 border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50 ${
        notification.isRead ? "bg-white" : "bg-[#004D77]/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="flex min-w-0 flex-1 gap-3 text-left"
      >
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconColor}`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="line-clamp-1 text-sm font-semibold text-[#004D77]">
              {notification.title}
            </span>
            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            )}
          </span>
          <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
            {notification.message}
          </span>
          <span className="mt-1 block text-[11px] font-medium text-slate-400">
            {formatDate(notification.createdAt)}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 flex-col gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        {!notification.isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
            aria-label="Marcar como leida"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Eliminar notificacion"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default NotificationItem;

