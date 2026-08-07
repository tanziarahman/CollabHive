import api from './axiosClient';

export const getMyJoinRequests = () => api.get('/join-requests/me').then((res) => res.data);

export const acceptJoinRequest = (id) =>
  api.patch(`/join-requests/${id}/accept`).then((res) => res.data);

export const rejectJoinRequest = (id) =>
  api.patch(`/join-requests/${id}/reject`).then((res) => res.data);

export const cancelJoinRequest = (id) => api.delete(`/join-requests/${id}`).then((res) => res.data);
