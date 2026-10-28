'use strict';

const request = require('supertest');
const { createTestDatabase, seedEmployee } = require('./helpers/testDb');
const createApp = require('../src/app');

let app;

beforeAll(() => {
  createTestDatabase();
  app = createApp();
});

describe('Employees API', () => {
  test('creates a valid employee and trims whitespace', async () => {
    const response = await request(app).post('/api/employees').send({
      name: '  Kasun   Perera  ',
      email: '  Kasun@Example.com ',
      department: 'IT',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      name: 'Kasun Perera',
      email: 'kasun@example.com',
      department: 'IT',
    });
    expect(response.body.data.id).toEqual(expect.any(Number));
    expect(response.body.data.createdAt).toEqual(expect.any(String));
  });

  test('rejects a missing name with a field specific message', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({ name: '   ', email: 'noname@example.com', department: 'HR' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false });
    expect(response.body.errors).toHaveProperty('name');
  });

  test('rejects an invalid email address', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({ name: 'Invalid Email', email: 'not-an-email', department: 'IT' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('email');
  });

  test('rejects an unsupported department', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({ name: 'Dept Tester', email: 'dept@example.com', department: 'Astronaut' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('department');
  });

  test('rejects a duplicate email address with 409', async () => {
    await request(app)
      .post('/api/employees')
      .send({ name: 'First Person', email: 'duplicate@example.com', department: 'IT' });

    const response = await request(app)
      .post('/api/employees')
      .send({ name: 'Second Person', email: 'DUPLICATE@example.com', department: 'HR' });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already exists/i);
    expect(response.body.errors).toHaveProperty('email');
  });

  test('lists employees sorted by name', async () => {
    const response = await request(app).get('/api/employees');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    const names = response.body.data.map((employee) => employee.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('supports searching employees by name, email or department', async () => {
    const response = await request(app).get('/api/employees').query({ search: 'kasun' });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.every((employee) => /kasun/i.test(employee.name))).toBe(true);
  });

  test('returns 404 for an unknown employee id', async () => {
    const response = await request(app).get('/api/employees/9999');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('returns 400 for a malformed employee id', async () => {
    const response = await request(app).get('/api/employees/abc');
    expect(response.status).toBe(400);
  });

  test('updates an employee record', async () => {
    const employee = seedEmployee({ email: 'update.me@example.com' });

    const response = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({ department: 'Finance' });

    expect(response.status).toBe(200);
    expect(response.body.data.department).toBe('Finance');
    expect(response.body.data.name).toBe(employee.name);
  });

  test('refuses to delete an employee who owns leave requests', async () => {
    const employee = seedEmployee({ email: 'has.leaves@example.com' });
    const { getDb } = require('../db');
    const now = new Date().toISOString();
    getDb()
      .prepare(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, created_at, updated_at)
         VALUES (?, 'Annual', '2026-12-01', '2026-12-02', 'Test', 'Pending', ?, ?)`,
      )
      .run(employee.id, now, now);

    const response = await request(app).delete(`/api/employees/${employee.id}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/cannot be deleted/i);

    const stillThere = await request(app).get(`/api/employees/${employee.id}`);
    expect(stillThere.status).toBe(200);
  });

  test('deletes an employee without leave requests', async () => {
    const employee = seedEmployee({ email: 'delete.me@example.com' });

    const response = await request(app).delete(`/api/employees/${employee.id}`);
    expect(response.status).toBe(200);

    const after = await request(app).get(`/api/employees/${employee.id}`);
    expect(after.status).toBe(404);
  });
});
