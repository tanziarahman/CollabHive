import api from './axiosClient';

export const getSettings = () => api.get('/settings').then((res) => res.data);

export const updateSettings = (data) => api.put('/settings', data).then((res) => res.data);

export const updateAccount = (data) => api.put('/settings/account', data).then((res) => res.data);

export const changePassword = (data) => api.put('/settings/password', data).then((res) => res.data);

export const deactivateAccount = () => api.post('/settings/deactivate').then((res) => res.data);

export const deleteAccount = (password) =>
  api.delete('/settings', { data: { password } }).then((res) => res.data);
