'use strict';

const request = require('supertest');
const { createTestDatabase, seedEmployee, seedLeaveRequest } = require('./helpers/testDb');
const createApp = require('../src/app');

let app;
let employee;

beforeAll(() => {
  createTestDatabase();
  app = createApp();
  employee = seedEmployee({ name: 'Nimali Fernando', email: 'nimali@example.com', department: 'HR' });
});

const validPayload = (overrides = {}) => ({
  employeeId: employee.id,
  leaveType: 'Annual',
  startDate: '2026-11-02',
  endDate: '2026-11-04',
  reason: 'Family vacation',
  ...overrides,
});

describe('Leave requests API - creation and validation', () => {
  test('creates a valid leave request with Pending status', async () => {
    const response = await request(app).post('/api/leaves').send(validPayload());

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      employeeId: employee.id,
      leaveType: 'Annual',
      startDate: '2026-11-02',
      endDate: '2026-11-04',
      status: 'Pending',
      rejectionReason: null,
    });
    expect(response.body.data.employee.name).toBe('Nimali Fernando');
    expect(response.body.data.totalDays).toBe(3);
  });

  test('ignores a client supplied status and always stores Pending', async () => {
    const response = await request(app)
      .post('/api/leaves')
      .send(validPayload({ status: 'Approved', rejectionReason: 'client supplied' }));

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('Pending');
    expect(response.body.data.rejectionReason).toBeNull();
  });

  test('rejects a request for an unknown employee', async () => {
    const response = await request(app).post('/api/leaves').send(validPayload({ employeeId: 99999 }));

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('employeeId');
  });

  test('rejects an unsupported leave type', async () => {
    const response = await request(app).post('/api/leaves').send(validPayload({ leaveType: 'Sabbatical' }));

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('leaveType');
  });

  test('rejects a missing reason', async () => {
    const response = await request(app).post('/api/leaves').send(validPayload({ reason: '   ' }));

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('reason');
  });

  test('rejects an end date before the start date', async () => {
    const response = await request(app)
      .post('/api/leaves')
      .send(validPayload({ startDate: '2026-11-10', endDate: '2026-11-04' }));

    expect(response.status).toBe(400);
    expect(response.body.errors.endDate).toMatch(/on or after/i);
  });

  test('accepts a single day request where start equals end', async () => {
    const response = await request(app)
      .post('/api/leaves')
      .send(validPayload({ startDate: '2026-11-05', endDate: '2026-11-05' }));

    expect(response.status).toBe(201);
    expect(response.body.data.totalDays).toBe(1);
  });

  test('rejects malformed and impossible dates', async () => {
    const badFormats = [
      { startDate: '02/11/2026', endDate: '2026-11-04' },
      { startDate: '2026-13-01', endDate: '2026-11-04' },
      { startDate: '2026-02-30', endDate: '2026-03-02' },
      { startDate: '2026-11-02', endDate: '' },
    ];

    for (const overrides of badFormats) {
      const response = await request(app).post('/api/leaves').send(validPayload(overrides));
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    }
  });

  test('rejects a missing employee selection', async () => {
    const response = await request(app).post('/api/leaves').send(validPayload({ employeeId: undefined }));
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('employeeId');
  });
});

describe('Leave requests API - listing, filtering and pagination', () => {
  test('lists requests including employee details and pagination metadata', async () => {
    const response = await request(app).get('/api/leaves').query({ page: 1, pageSize: 5 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body.pagination).toMatchObject({ page: 1, pageSize: 5 });
    expect(response.body.pagination.total).toBeGreaterThan(0);
    expect(response.body.data[0].employee).toHaveProperty('name');
  });

  test('filters by status and leave type', async () => {
    const pending = await request(app).get('/api/leaves').query({ status: 'Pending' });
    expect(pending.status).toBe(200);
    expect(pending.body.data.every((item) => item.status === 'Pending')).toBe(true);

    const medical = await request(app).get('/api/leaves').query({ leaveType: 'Medical' });
    expect(medical.status).toBe(200);
    expect(medical.body.data.every((item) => item.leaveType === 'Medical')).toBe(true);
  });

  test('searches by employee name and by reason', async () => {
    await request(app).post('/api/leaves').send(
      validPayload({ reason: 'Dentist appointment in Colombo', startDate: '2027-01-05', endDate: '2027-01-05' }),
    );

    const byName = await request(app).get('/api/leaves').query({ search: 'Nimali' });
    expect(byName.status).toBe(200);
    expect(byName.body.data.length).toBeGreaterThan(0);

    const byReason = await request(app).get('/api/leaves').query({ search: 'Dentist' });
    expect(byReason.status).toBe(200);
    expect(byReason.body.data).toHaveLength(1);
  });

  test('rejects an invalid status filter instead of silently ignoring it', async () => {
    const response = await request(app).get('/api/leaves').query({ status: 'Cancelled' });
    expect(response.status).toBe(400);
  });
});

describe('Leave requests API - approval and rejection workflow', () => {
  test('approves a pending request', async () => {
    const leave = seedLeaveRequest({ employee });

    const response = await request(app).patch(`/api/leaves/${leave.id}/approve`);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('Approved');
    expect(response.body.data.rejectionReason).toBeNull();
  });

  test('prevents approving an already approved request', async () => {
    const leave = seedLeaveRequest({ employee, status: 'Approved' });

    const response = await request(app).patch(`/api/leaves/${leave.id}/approve`);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already been approved/i);
  });

  test('rejects an approved request', async () => {
    const leave = seedLeaveRequest({ employee, status: 'Approved' });

    const response = await request(app)
      .patch(`/api/leaves/${leave.id}/reject`)
      .send({ rejectionReason: 'Too late' });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already been approved/i);
  });

  test('rejects a pending request with a reason and stores it', async () => {
    const leave = seedLeaveRequest({ employee });

    const response = await request(app)
      .patch(`/api/leaves/${leave.id}/reject`)
      .send({ rejectionReason: '  Insufficient staffing during the requested period.  ' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('Rejected');
    expect(response.body.data.rejectionReason).toBe('Insufficient staffing during the requested period.');

    const fetched = await request(app).get(`/api/leaves/${leave.id}`);
    expect(fetched.body.data.status).toBe('Rejected');
    expect(fetched.body.data.rejectionReason).toBe('Insufficient staffing during the requested period.');
  });

  test('rejects a rejection without a reason', async () => {
    const leave = seedLeaveRequest({ employee });

    const response = await request(app).patch(`/api/leaves/${leave.id}/reject`).send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('rejectionReason');
  });

  test('prevents rejecting an already rejected request', async () => {
    const leave = seedLeaveRequest({ employee, status: 'Rejected', rejectionReason: 'First rejection' });

    const response = await request(app)
      .patch(`/api/leaves/${leave.id}/reject`)
      .send({ rejectionReason: 'Second attempt' });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already been rejected/i);
  });

  test('prevents approving a rejected request', async () => {
    const leave = seedLeaveRequest({ employee, status: 'Rejected', rejectionReason: 'No coverage' });

    const response = await request(app).patch(`/api/leaves/${leave.id}/approve`);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already been rejected/i);
  });

  test('returns 404 when approving or rejecting a nonexistent request', async () => {
    const approve = await request(app).patch('/api/leaves/424242/approve');
    expect(approve.status).toBe(404);

    const reject = await request(app).patch('/api/leaves/424242/reject').send({ rejectionReason: 'Nope' });
    expect(reject.status).toBe(404);
  });

  test('returns 400 for a malformed request id', async () => {
    const response = await request(app).patch('/api/leaves/not-a-number/approve');
    expect(response.status).toBe(400);
  });

  test('keeps the first decision when two approvals race', async () => {
    const leave = seedLeaveRequest({ employee });

    const [first, second] = await Promise.all([
      request(app).patch(`/api/leaves/${leave.id}/approve`),
      request(app).patch(`/api/leaves/${leave.id}/approve`),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 409]);
  });
});
