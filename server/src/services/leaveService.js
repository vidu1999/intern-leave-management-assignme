'use strict';

const ApiError = require('../utils/ApiError');
const leaveRepository = require('../data/leaveRepository');
const employeeRepository = require('../data/employeeRepository');
const { validateCreateLeavePayload, validateRejectionPayload } = require('../validators/leaveValidator');
const { validateLeaveQuery } = require('../validators/leaveQueryValidator');
const { parseIdParam, parsePagination } = require('../validators/common');

const STATUS_TRANSITION_MESSAGES = {
  Approved: 'This leave request has already been approved and cannot be processed again.',
  Rejected: 'This leave request has already been rejected and cannot be processed again.',
};

function listLeaveRequests(query = {}) {
  const filters = validateLeaveQuery(query);
  const { page, pageSize, offset } = parsePagination(query);
  const result = leaveRepository.listLeaveRequests({ ...filters, page, pageSize, offset });

  return {
    items: result.items,
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
    },
  };
}

function getLeaveRequestById(rawId) {
  const id = parseIdParam(rawId, 'leave request id');
  const request = leaveRepository.findLeaveRequestById(id);
  if (!request) {
    throw ApiError.notFound(`Leave request with id ${id} was not found.`);
  }
  return request;
}

function createLeaveRequest(body) {
  const data = validateCreateLeavePayload(body);

  const employee = employeeRepository.findEmployeeById(data.employeeId);
  if (!employee) {
    throw ApiError.validation({ employeeId: 'The selected employee does not exist.' });
  }

  // Status is assigned by the backend (Pending), never by the client.
  return leaveRepository.insertLeaveRequest({
    employeeId: employee.id,
    leaveType: data.leaveType,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
  });
}

function approveLeaveRequest(rawId) {
  const id = parseIdParam(rawId, 'leave request id');
  const existing = leaveRepository.findLeaveRequestById(id);
  if (!existing) {
    throw ApiError.notFound(`Leave request with id ${id} was not found.`);
  }

  // Conditional UPDATE ... WHERE status = 'Pending' makes the transition atomic:
  // a concurrent approval can never overwrite an already processed request.
  const updated = leaveRepository.markApproved(id);
  if (!updated) {
    const current = leaveRepository.findLeaveRequestById(id);
    if (!current) throw ApiError.notFound(`Leave request with id ${id} was not found.`);
    throw ApiError.conflict(STATUS_TRANSITION_MESSAGES[current.status]);
  }

  return leaveRepository.findLeaveRequestById(id);
}

function rejectLeaveRequest(rawId, body) {
  const id = parseIdParam(rawId, 'leave request id');
  const { rejectionReason } = validateRejectionPayload(body);

  const existing = leaveRepository.findLeaveRequestById(id);
  if (!existing) {
    throw ApiError.notFound(`Leave request with id ${id} was not found.`);
  }

  const updated = leaveRepository.markRejected(id, rejectionReason);
  if (!updated) {
    const current = leaveRepository.findLeaveRequestById(id);
    if (!current) throw ApiError.notFound(`Leave request with id ${id} was not found.`);
    throw ApiError.conflict(STATUS_TRANSITION_MESSAGES[current.status]);
  }

  return leaveRepository.findLeaveRequestById(id);
}

module.exports = {
  listLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
};
