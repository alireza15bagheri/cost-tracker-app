// frontend/src/services/budgets.js
import api from './api';

/**
 * Fetch budgets.
 * Supports optional query params and both paginated (`results`) and plain array responses.
 */
export async function listBudgets(params = {}) {
  const { data } = await api.get('budgets/', { params });
  return data?.results ?? data;
}

/**
 * Create a new budget entry.
 */
export async function createBudget(payload) {
  const { data } = await api.post('budgets/', payload);
  return data;
}

/**
 * Delete a budget by id.
 */
export const deleteBudget = (id) =>
  api.delete(`budgets/${id}/`).then((res) => res.data);

/**
 * Update a budget's status to any allowed value.
 * This replaces `markBudgetPaid` with something more generic.
 */
export const updateBudgetStatus = (id, status) =>
  api.patch(`budgets/${id}/`, { status }).then((res) => res.data);

/**
 * (Optional) Keep this if other parts of your code still call it directly.
 * You can safely remove it once all usages are replaced with `updateBudgetStatus`.
 */
export const markBudgetPaid = (id) =>
  updateBudgetStatus(id, 'paid');
