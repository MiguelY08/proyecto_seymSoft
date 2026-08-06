import { Trash2 } from "lucide-react";
import NotificationEmpty from "./NotificationEmpty";
import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";

function NotificationDropdown({
  notifications,
  loading,
  error,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onClose,
  onOpenNotification,
}) {
  return (
    <div className="fixed left-3 right-3 top-16 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <div>
          <p className="text-sm font-semibold text-[#004D77]">
            Notificaciones
          </p>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al dia"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-[#004D77] transition-colors hover:bg-[#004D77]/10"
            >
              Marcar leídas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onDeleteAll}
              className="shrink-0 flex items-center justify-center rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Limpiar todas"
              aria-label="Limpiar todas"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto sm:max-h-[24rem]">
        {loading && <NotificationSkeleton />}

        {!loading && error && (
          <div className="px-4 py-5 text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <NotificationEmpty />
        )}

        {!loading && !error && notifications.length > 0 && (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
              onClose={onClose}
              onOpenNotification={onOpenNotification}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
