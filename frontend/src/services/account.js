import api from './api';

export async function signup({ username, password }) {
  const { data } = await api.post('signup/', { username, password });
  return data;
}
