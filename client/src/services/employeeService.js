import api, { toApiError } from './api.js';

export async function fetchEmployees({ search = '' } = {}) {
  try {
    const { data } = await api.get('/employees', { params: search ? { search } : undefined });
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createEmployee(payload) {
  try {
    const { data } = await api.post('/employees', payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateEmployee(id, payload) {
  try {
    const { data } = await api.patch(`/employees/${id}`, payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteEmployee(id) {
  try {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
