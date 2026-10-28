import api, { toApiError } from './api.js';

export async function fetchLeaveRequests(params = {}) {
  try {
    const { data } = await api.get('/leaves', { params });
    return { items: data.data, pagination: data.pagination };
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchLeaveRequest(id) {
  try {
    const { data } = await api.get(`/leaves/${id}`);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createLeaveRequest(payload) {
  try {
    const { data } = await api.post('/leaves', payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function approveLeaveRequest(id) {
  try {
    const { data } = await api.patch(`/leaves/${id}/approve`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function rejectLeaveRequest(id, rejectionReason) {
  try {
    const { data } = await api.patch(`/leaves/${id}/reject`, { rejectionReason });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
