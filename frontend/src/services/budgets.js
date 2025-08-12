import api from './api';

export async function listBudgets(params = {}) {
  const { data } = await api.get('budgets/', { params });
  return data?.results ?? data;
}
