'use strict';

const asyncHandler = require('../utils/asyncHandler');
const employeeService = require('../services/employeeService');

const list = asyncHandler((req, res) => {
  const employees = employeeService.listEmployees(req.query);
  res.status(200).json({ success: true, data: employees, count: employees.length });
});

const getOne = asyncHandler((req, res) => {
  const employee = employeeService.getEmployeeById(req.params.id);
  res.status(200).json({ success: true, data: employee });
});

const create = asyncHandler((req, res) => {
  const employee = employeeService.createEmployee(req.body);
  res.status(201).json({ success: true, message: 'Employee created successfully.', data: employee });
});

const update = asyncHandler((req, res) => {
  const employee = employeeService.updateEmployee(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Employee updated successfully.', data: employee });
});

const remove = asyncHandler((req, res) => {
  const result = employeeService.deleteEmployee(req.params.id);
  res.status(200).json({ success: true, message: 'Employee deleted successfully.', data: result });
});

module.exports = { list, getOne, create, update, remove };
