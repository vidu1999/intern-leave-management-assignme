'use strict';

const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');

const summary = asyncHandler((req, res) => {
  res.status(200).json({ success: true, data: reportService.getSummary() });
});

module.exports = { summary };
