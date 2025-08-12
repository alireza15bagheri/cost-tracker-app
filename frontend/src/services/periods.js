// services/periods.js
import api from './api';

export async function listPeriods() {
  const { data } = await api.get('periods/'); // Note: no leading slash
  return data;
}
