import api from './axiosClient';

export const updateProfile = (data) => api.put('/users/profile', data).then((res) => res.data);

export const searchUsers = (params) => api.get('/users/search', { params }).then((res) => res.data);

export const getSuggestions = () => api.get('/users/suggestions').then((res) => res.data);

export const getFollowRequests = () => api.get('/users/follow-requests').then((res) => res.data);

export const getConnections = (type) =>
  api.get(`/users/connections/${type}`).then((res) => res.data);

export const sendFollowRequest = (userId) =>
  api.post(`/users/${userId}/follow-request`).then((res) => res.data);

export const respondToFollowRequest = (userId, action) =>
  api.patch(`/users/follow-requests/${userId}`, { action }).then((res) => res.data);

export const getPublicProfile = (userId) =>
  api.get(`/users/${userId}/profile`).then((res) => res.data);
