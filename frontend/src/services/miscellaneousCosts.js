import api from './api';

const ENDPOINT = 'misc-costs/';

export const listMiscellaneousCosts = async (params = {}) => {
  const { data } = await api.get(ENDPOINT, { params });
  return data?.results ?? data;
};

export const createMiscellaneousCost = async (payload) => {
  const { data } = await api.post(ENDPOINT, payload);
  return data;
};

export const deleteMiscellaneousCost = (id) =>
  api.delete(`${ENDPOINT}${id}/`).then((res) => res.data);