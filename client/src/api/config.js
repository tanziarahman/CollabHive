import api from './axiosClient';

export const getProjectConfig = () => api.get('/config/project-config').then((res) => res.data);
