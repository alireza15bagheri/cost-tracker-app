// frontend/src/services/dailyHouseSpendings.js
import api from './api';

const ENDPOINT = 'daily-house-spendings/';

// GET list of daily house spendings (optionally filtered by params)
export const listDailyHouseSpendings = (token, params = {}) => {
  return api.get(ENDPOINT, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// POST create a new daily house spending entry
export const createDailyHouseSpending = (token, data) => {
  return api.post(ENDPOINT, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// DELETE a daily house spending entry by id
export const deleteDailyHouseSpending = (token, id) => {
  return api.delete(`${ENDPOINT}${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
