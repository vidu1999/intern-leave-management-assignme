'use strict';

const employeeRepository = require('../data/employeeRepository');
const leaveRepository = require('../data/leaveRepository');

/**
 * Aggregated figures used by the dashboard, the reports page and the sidebar
 * counters. Every number is computed from the database - nothing is mocked.
 */
function getSummary() {
  const byStatus = leaveRepository.countByStatus();
  const byLeaveType = leaveRepository.countByLeaveType();
  const totalLeaveRequests = leaveRepository.countLeaveRequests();
  const totalEmployees = employeeRepository.countEmployees();

  return {
    totals: {
      employees: totalEmployees,
      leaveRequests: totalLeaveRequests,
      pending: byStatus.Pending,
      approved: byStatus.Approved,
      rejected: byStatus.Rejected,
    },
    byStatus: [
      { status: 'Pending', count: byStatus.Pending },
      { status: 'Approved', count: byStatus.Approved },
      { status: 'Rejected', count: byStatus.Rejected },
    ],
    byLeaveType: [
      { leaveType: 'Annual', count: byLeaveType.Annual },
      { leaveType: 'Casual', count: byLeaveType.Casual },
      { leaveType: 'Medical', count: byLeaveType.Medical },
    ],
    recentRequests: leaveRepository.findRecentLeaveRequests(5),
  };
}

module.exports = { getSummary };
