'use strict';

const request = require('supertest');
const { createTestDatabase, seedEmployee, seedLeaveRequest } = require('./helpers/testDb');
const createApp = require('../src/app');

let app;

beforeAll(() => {
  createTestDatabase();
  app = createApp();
});

describe('Reports API', () => {
  test('returns zeroed statistics for an empty database', async () => {
    const response = await request(app).get('/api/reports/summary');

    expect(response.status).toBe(200);
    expect(response.body.data.totals).toEqual({
      employees: 0,
      leaveRequests: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    });
    expect(response.body.data.byStatus.map((row) => row.count)).toEqual([0, 0, 0]);
    expect(response.body.data.recentRequests).toEqual([]);
  });

  test('aggregates real database rows', async () => {
    const first = seedEmployee({ name: 'Alpha One', email: 'alpha@example.com', department: 'IT' });
    const second = seedEmployee({ name: 'Beta Two', email: 'beta@example.com', department: 'HR' });

    seedLeaveRequest({ employee: first, leaveType: 'Annual', status: 'Approved' });
    seedLeaveRequest({ employee: first, leaveType: 'Casual', status: 'Pending' });
    seedLeaveRequest({ employee: second, leaveType: 'Medical', status: 'Pending' });
    seedLeaveRequest({
      employee: second,
      leaveType: 'Annual',
      status: 'Rejected',
      rejectionReason: 'Staffing conflict',
    });

    const response = await request(app).get('/api/reports/summary');
    const { totals, byStatus, byLeaveType, recentRequests } = response.body.data;

    expect(totals).toEqual({ employees: 2, leaveRequests: 4, pending: 2, approved: 1, rejected: 1 });
    expect(byStatus).toEqual([
      { status: 'Pending', count: 2 },
      { status: 'Approved', count: 1 },
      { status: 'Rejected', count: 1 },
    ]);
    expect(byLeaveType).toEqual([
      { leaveType: 'Annual', count: 2 },
      { leaveType: 'Casual', count: 1 },
      { leaveType: 'Medical', count: 1 },
    ]);
    expect(recentRequests).toHaveLength(4);
  });

  test('returns a JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: expect.stringContaining('was not found'),
    });
  });

  test('exposes a health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });
});
