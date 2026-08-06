import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../access/context/AuthContext";
import notificationService from "../services/notificationService";
import { NotificationContext } from "./notificationContextValue";

const NOTIFICATION_REFRESH_INTERVAL_MS = 60 * 1000;

export const NotificationProvider = ({ children }) => {
  const {
    isAuthenticated,
    loading: authLoading,
    user,
  } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setPagination(null);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [notificationResult, countResult] = await Promise.all([
        notificationService.getNotifications(params),
        notificationService.getUnreadCount(),
      ]);

      setNotifications(notificationResult.notifications);
      setPagination(notificationResult.pagination);
      setUnreadCount(countResult);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
        || "No fue posible cargar las notificaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id) => {
    const notification = await notificationService.markAsRead(id);
    let updatedNotification = null;
    const wasUnread = notifications.some((currentNotification) => (
      currentNotification.id === id && !currentNotification.isRead
    ));

    setNotifications((currentNotifications) => (
      currentNotifications.map((currentNotification) => {
        if (currentNotification.id !== id) return currentNotification;

        updatedNotification = {
          ...currentNotification,
          ...notification,
          id: notification.id ?? currentNotification.id,
          title: notification.title || currentNotification.title,
          message: notification.message || currentNotification.message,
          type: notification.type || currentNotification.type,
          createdAt: notification.createdAt || currentNotification.createdAt,
          updatedAt: notification.updatedAt || currentNotification.updatedAt,
          actionUrl: notification.actionUrl || currentNotification.actionUrl,
          metadata: notification.metadata || currentNotification.metadata,
          isRead: true,
        };

        return updatedNotification;
      })
    ));

    if (wasUnread) {
      setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
    }

    return updatedNotification ?? notification;
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const result = await notificationService.markAllAsRead();

    setNotifications((currentNotifications) => (
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    ));
    setUnreadCount(0);
    return result;
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const localNotification = notifications.find((notification) => (
      notification.id === id
    ));
    const deletedNotification =
      await notificationService.deleteNotification(id);

    setNotifications((currentNotifications) => (
      currentNotifications.filter((notification) => notification.id !== id)
    ));

    if (localNotification && !localNotification.isRead) {
      setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
    }

    return deletedNotification;
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
    const result = await notificationService.deleteAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
    return result;
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setNotifications([]);
      setPagination(null);
      setUnreadCount(0);
      setError(null);
      return;
    }

    refreshNotifications();
  }, [
    authLoading,
    isAuthenticated,
    refreshNotifications,
    user?.id,
    user?.idUser,
    user?.id_user,
  ]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return undefined;

    const intervalId = window.setInterval(() => {
      refreshNotifications();
    }, NOTIFICATION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [
    authLoading,
    isAuthenticated,
    refreshNotifications,
  ]);

  const value = useMemo(() => ({
    notifications,
    pagination,
    loading,
    error,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  }), [
    notifications,
    pagination,
    loading,
    error,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
