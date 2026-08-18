import api from './axiosClient';

export const getProjects = () => api.get('/projects').then((res) => res.data);

export const getProjectFeed = () => api.get('/projects/feed').then((res) => res.data);

export const getMyProjects = () => api.get('/projects/user/my-projects').then((res) => res.data);

export const getMyCollaborations = () => api.get('/projects/collaborations').then((res) => res.data);

export const getProjectById = (id) => api.get(`/projects/${id}`).then((res) => res.data);

export const createProject = (data) => api.post('/projects', data).then((res) => res.data);

export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then((res) => res.data);

export const deleteProject = (id) => api.delete(`/projects/${id}`).then((res) => res.data);

export const getSuggestedCollaborators = (id, limit) =>
  api.get(`/projects/${id}/suggestions`, { params: { limit } }).then((res) => res.data);

export const createJoinRequest = (projectId, data) =>
  api.post(`/projects/${projectId}/join-requests`, data).then((res) => res.data);

export const getProjectJoinRequests = (projectId) =>
  api.get(`/projects/${projectId}/join-requests`).then((res) => res.data);

export const inviteUser = (projectId, data) =>
  api.post(`/projects/${projectId}/invite`, data).then((res) => res.data);

export const getProjectMessages = (projectId) =>
  api.get(`/projects/${projectId}/messages`).then((res) => res.data);
