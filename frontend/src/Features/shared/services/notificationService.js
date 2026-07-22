import apiClient from "../../../setting/apiClient.js";

const getData = (response) => response?.data?.data ?? null;

const normalizeNotification = (notification) => ({
  id: notification?.id,
  title: notification?.title || "",
  message: notification?.message || "",
  type: notification?.type || "info",
  isRead: Boolean(notification?.isRead),
  createdAt: notification?.createdAt || null,
  updatedAt: notification?.updatedAt || null,
  actionUrl: notification?.actionUrl || null,
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
    return normalizeNotification(getData(response));
  },

  async markAllAsRead() {
    const response = await apiClient.patch("/notifications/read-all");
    return getData(response);
  },

  async deleteNotification(id) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return normalizeNotification(getData(response));
  },
};

export default notificationService;

