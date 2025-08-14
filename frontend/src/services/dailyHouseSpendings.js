// src/services/dailyHouseSpendings.js
import api from './api';

const ENDPOINT = 'daily-house-spendings/';

// GET list
export const listDailyHouseSpendings = (token, params = {}) => {
  return api.get(ENDPOINT, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// POST create
export const createDailyHouseSpending = (token, data) => {
  return api.post(ENDPOINT, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
