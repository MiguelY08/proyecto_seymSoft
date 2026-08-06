import apiClient from "../../../setting/apiClient.js";

const getData = (response) => response?.data?.data ?? null;

const normalizeNotification = (notification) => ({
  id: notification?.id ?? notification?.id_notification,
  title: notification?.title || "",
  message: notification?.message || "",
  type: notification?.type || "info",
  isRead: Boolean(notification?.isRead ?? notification?.is_read),
  createdAt: notification?.createdAt || notification?.created_at || null,
  updatedAt: notification?.updatedAt || notification?.updated_at || null,
  actionUrl: notification?.actionUrl || notification?.action_url || null,
  metadata: notification?.metadata || null,
});

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await apiClient.get("/notifications", { params });
    const data = response?.data || {};

    return {
      notifications: (data.data || []).map(normalizeNotification),
      pagination: data.pagination || null,
    };
  },

  async getUnreadCount() {
    const response = await apiClient.get("/notifications/unread-count");
    return Number(getData(response)?.unreadCount || 0);
  },

  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    const data = getData(response);

    return data
      ? normalizeNotification(data)
      : { id, isRead: true };
  },

  async markAllAsRead() {
    const response = await apiClient.patch("/notifications/read-all");
    return getData(response);
  },

  async deleteNotification(id) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return normalizeNotification(getData(response));
  },

  async deleteAllNotifications() {
    const response = await apiClient.delete("/notifications/all");
    return getData(response);
  },
};

export default notificationService;
