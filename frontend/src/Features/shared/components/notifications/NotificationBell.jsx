import { Bell } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../../access/context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationBadge from "./NotificationBadge";
import NotificationDetailModal from "./NotificationDetailModal";
import NotificationDropdown from "./NotificationDropdown";

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    loading,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (
        containerRef.current
        && !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleToggle = () => {
    if (!open) {
      refreshNotifications();
    }

    setOpen((currentOpen) => !currentOpen);
  };

  const handleOpenNotification = (notification) => {
    setSelectedNotification(notification);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-[#004D77]/10 hover:text-[#004D77]"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        <NotificationBadge count={unreadCount} />
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClose={() => setOpen(false)}
          onOpenNotification={handleOpenNotification}
        />
      )}

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}

export default NotificationBell;
