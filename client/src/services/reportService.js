import api, { toApiError } from './api.js';

export async function fetchSummary() {
  try {
    const { data } = await api.get('/reports/summary');
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}
