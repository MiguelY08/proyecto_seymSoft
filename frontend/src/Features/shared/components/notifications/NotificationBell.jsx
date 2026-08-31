import { Bell } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../access/context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";

const ensureInternalPath = (path) => {
  if (!path || typeof path !== "string") return null;

  const trimmedPath = path.trim();
  if (!trimmedPath) return null;

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const url = new URL(trimmedPath);
      return `${url.pathname}${url.search}${url.hash}` || "/";
    } catch {
      return null;
    }
  }

  return trimmedPath.startsWith("/")
    ? trimmedPath
    : `/${trimmedPath}`;
};

const getNotificationTargetPath = (notification) => {
  const metadata = notification?.metadata || {};
  const actionPath = ensureInternalPath(
    notification?.actionUrl || metadata.actionUrl
  );

  const orderId = metadata.orderId || metadata.idOrder || metadata.order_id;
  const productId = metadata.productId || metadata.idProduct || metadata.product_id;
  const module = String(metadata.module || "").toLowerCase();

  if (actionPath) {
    if (actionPath === "/orders" && orderId) {
      return `/orders-l/${orderId}`;
    }

    if (actionPath === "/orders-l" && orderId) {
      return `/orders-l/${orderId}`;
    }

    if (actionPath === "/admin/sales/orders" && orderId) {
      return `/admin/sales/orders/${orderId}`;
    }

    if (actionPath === "/admin/purchases/products" && productId) {
      return `/admin/purchases/products/${productId}/edit`;
    }

    return actionPath;
  }

  if (orderId) {
    return module === "orders" || metadata.saleType
      ? `/admin/sales/orders/${orderId}`
      : `/orders-l/${orderId}`;
  }

  if (productId) {
    return module === "products"
      ? `/admin/purchases/products/${productId}/edit`
      : "/cart";
  }

  return null;
};

function NotificationBell() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    pagination,
    loading,
    loadingMore,
    error,
    loadMoreError,
    unreadCount,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [open, setOpen] = useState(false);
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
    const targetPath = getNotificationTargetPath(notification);
    setOpen(false);

    if (targetPath) {
      navigate(targetPath, {
        state: {
          fromNotification: true,
          notification,
        },
      });
    }
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
          loadingMore={loadingMore}
          error={error}
          loadMoreError={loadMoreError}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onDeleteAll={deleteAllNotifications}
          hasMore={Boolean(
            pagination && (
              pagination.hasNextPage
              ?? pagination.has_next_page
              ?? Number(pagination.page ?? pagination.currentPage ?? pagination.current_page ?? 1)
                < Number(pagination.totalPages ?? pagination.total_pages ?? 1)
            )
          )}
          onLoadMore={loadMoreNotifications}
          onClose={() => setOpen(false)}
          onOpenNotification={handleOpenNotification}
        />
      )}
    </div>
  );
}

export default NotificationBell;
