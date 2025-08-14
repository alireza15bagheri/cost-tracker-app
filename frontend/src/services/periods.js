// frontend/src/services/periods.js
import api from './api';

/**
 * Fetch all periods (supports paginated and non-paginated responses).
 */
export async function listPeriods(params = {}) {
  const { data } = await api.get('periods/', { params });
  return data?.results ?? data;
}

/**
 * Create a new period.
 */
export async function createPeriod(payload) {
  const { data } = await api.post('periods/', payload);
  return data;
}

/**
 * Update a period by id (partial update).
 */
export async function updatePeriod(id, payload) {
  const { data } = await api.patch(`periods/${id}/`, payload);
  return data;
}

/**
 * Delete a period by id (and any backend-cascaded related data).
 */
export async function deletePeriod(id) {
  await api.delete(`periods/${id}/`);
  return true;
}
