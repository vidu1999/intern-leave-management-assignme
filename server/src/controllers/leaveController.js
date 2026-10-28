'use strict';

const asyncHandler = require('../utils/asyncHandler');
const leaveService = require('../services/leaveService');

const list = asyncHandler((req, res) => {
  const { items, pagination } = leaveService.listLeaveRequests(req.query);
  res.status(200).json({ success: true, data: items, pagination });
});

const getOne = asyncHandler((req, res) => {
  const request = leaveService.getLeaveRequestById(req.params.id);
  res.status(200).json({ success: true, data: request });
});

const create = asyncHandler((req, res) => {
  const request = leaveService.createLeaveRequest(req.body);
  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully.',
    data: request,
  });
});

const approve = asyncHandler((req, res) => {
  const request = leaveService.approveLeaveRequest(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Leave request approved successfully.',
    data: request,
  });
});

const reject = asyncHandler((req, res) => {
  const request = leaveService.rejectLeaveRequest(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Leave request rejected successfully.',
    data: request,
  });
});

module.exports = { list, getOne, create, approve, reject };
