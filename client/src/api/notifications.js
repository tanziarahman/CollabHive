import api from './axiosClient';

export const getNotifications = () => api.get('/notifications').then((res) => res.data);

export const getUnreadCount = () => api.get('/notifications/unread-count').then((res) => res.data);

export const markAsRead = (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data);

export const markAllAsRead = () => api.patch('/notifications/read-all').then((res) => res.data);
