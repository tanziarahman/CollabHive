import api from './axiosClient';

export const getProjectComments = (projectId) =>
  api.get(`/projects/${projectId}/comments`).then((res) => res.data);

export const addComment = (projectId, text) =>
  api.post(`/projects/${projectId}/comments`, { text }).then((res) => res.data);

export const deleteComment = (projectId, commentId) =>
  api.delete(`/projects/${projectId}/comments/${commentId}`).then((res) => res.data);
