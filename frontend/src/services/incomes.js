import api from './api';

export async function listIncomes(params = {}) {
  const { data } = await api.get('incomes/', { params });
  return data?.results ?? data;
}

export async function createIncome(payload) {
  const { data } = await api.post('incomes/', payload);
  return data;
}

export const deleteIncome = (id) =>
  api.delete(`incomes/${id}/`).then(res => res.data);
