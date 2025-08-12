import api from './api';

export async function listPeriods() {
  const { data } = await api.get('periods/');
  return data;
}

export async function createPeriod(payload) {
  const { data } = await api.post('periods/', payload);
  return data;
}
