// /home/alireza/cost-tracker/frontend/src/services/dailyHouseSpendings.js
import api from './api';

const ENDPOINT = 'daily-house-spendings/';

export const listDailyHouseSpendings = (params = {}) =>
  api.get(ENDPOINT, { params });

export const createDailyHouseSpending = (data) =>
  api.post(ENDPOINT, data);

export const deleteDailyHouseSpending = (id) =>
  api.delete(`${ENDPOINT}${id}/`);
