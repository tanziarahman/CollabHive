export const getToken = () => localStorage.getItem('token');

export const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setSession = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isLoggedIn = () => Boolean(getToken());
