'use strict';

const ApiError = require('../utils/ApiError');
const employeeRepository = require('../data/employeeRepository');
const { validateEmployeePayload } = require('../validators/employeeValidator');
const { parseIdParam, normaliseText } = require('../validators/common');

/** Business rules for employees. Controllers stay thin and delegate here. */

function listEmployees(query = {}) {
  const search = normaliseText(query.search);
  if (search && search.length > 100) {
    throw ApiError.badRequest('The search term must be 100 characters or fewer.');
  }
  return employeeRepository.listEmployees({ search: search || undefined });
}

function getEmployeeById(rawId) {
  const id = parseIdParam(rawId, 'employee id');
  const employee = employeeRepository.findEmployeeById(id);
  if (!employee) {
    throw ApiError.notFound(`Employee with id ${id} was not found.`);
  }
  return employee;
}

function assertEmailIsAvailable(email, { ignoreEmployeeId } = {}) {
  const existing = employeeRepository.findEmployeeByEmail(email);
  if (existing && existing.id !== ignoreEmployeeId) {
    throw ApiError.conflict('An employee with this email address already exists.', {
      email: 'An employee with this email address already exists.',
    });
  }
}

function createEmployee(body) {
  const data = validateEmployeePayload(body);
  assertEmailIsAvailable(data.email);
  return employeeRepository.insertEmployee(data);
}

function updateEmployee(rawId, body) {
  const id = parseIdParam(rawId, 'employee id');
  const existing = employeeRepository.findEmployeeById(id);
  if (!existing) {
    throw ApiError.notFound(`Employee with id ${id} was not found.`);
  }

  const data = validateEmployeePayload(body, { partial: true });
  if (data.email) {
    assertEmailIsAvailable(data.email, { ignoreEmployeeId: id });
  }

  return employeeRepository.updateEmployee(id, data);
}

/**
 * Deletion policy (documented in the README):
 * an employee who still owns leave requests cannot be deleted, so historical
 * leave records can never be orphaned. The database enforces the same rule
 * with an ON DELETE RESTRICT foreign key.
 */
function deleteEmployee(rawId) {
  const id = parseIdParam(rawId, 'employee id');
  const existing = employeeRepository.findEmployeeById(id);
  if (!existing) {
    throw ApiError.notFound(`Employee with id ${id} was not found.`);
  }

  const requestCount = employeeRepository.countLeaveRequestsForEmployee(id);
  if (requestCount > 0) {
    throw ApiError.conflict(
      `This employee has ${requestCount} leave request(s) and cannot be deleted. ` +
        'Delete policy: employees with leave history are retained.',
      { employee: 'Employees with leave requests cannot be deleted.' },
    );
  }

  employeeRepository.deleteEmployee(id);
  return { id };
}

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
