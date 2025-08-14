import api from './api';

export async function listBudgets(params = {}) {
  const { data } = await api.get('budgets/', { params });
  return data?.results ?? data;
}

export async function createBudget(payload) {
  const { data } = await api.post('budgets/', payload);
  return data;
}

export const markBudgetPaid = (id) =>
  api.patch(`budgets/${id}/`, { status: 'paid' })
     .then(res => res.data);
