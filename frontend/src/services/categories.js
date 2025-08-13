// src/services/categories.js
import api from './api';

/**
 * Fetch all categories from the server.
 * Returns an array of categories.
 */
export async function listCategories() {
  const { data } = await api.get('categories/');
  // Many paginated APIs return { results: [...] }
  return data?.results ?? data;
}

/**
 * Create a new category on the server.
 * @param {Object} payload - The category data to send
 * @param {string} payload.name - Name of the category (required)
 * @param {string} [payload.description] - Optional description
 * @returns {Object} - The newly created category
 */
export async function createCategory(payload) {
  const { data } = await api.post('categories/', payload);
  return data;
}
