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
  onClose,
  onOpenNotification,
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#004D77]">
            Notificaciones
          </p>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al dia"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="rounded-md px-2 py-1 text-xs font-semibold text-[#004D77] transition-colors hover:bg-[#004D77]/10"
          >
            Marcar todas
          </button>
        )}
      </div>

      <div className="max-h-[24rem] overflow-y-auto">
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
