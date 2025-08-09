import api from './api';

// GET /api/incomes/
export const listIncomes = async () => {
  const { data } = await api.get('/incomes/');
  return data;
};

// POST /api/incomes/
export const createIncome = async (payload) => {
  const { data } = await api.post('/incomes/', payload);
  return data;
};
