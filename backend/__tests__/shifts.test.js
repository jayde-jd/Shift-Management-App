// Mock the datastore and timezone service modules
jest.mock('../services/datastore');
jest.mock('../services/timezone');

const request = require('supertest');
const express = require('express');
const shiftRouter = require('../routes/shifts');
const datastore = require('../services/datastore');
const timezone = require('../services/timezone');

// Set up Express app with JSON parsing and the shift router
const app = express();
app.use(express.json());
app.use('/shifts', shiftRouter);

describe('Shift API', () => {
  // Reset mocks and set default timezone before each test
  beforeEach(() => {
    jest.clearAllMocks();
    timezone.getTimezone.mockResolvedValue('UTC');
  });

  // Test: Creating a valid shift
  it('POST /shifts creates a valid shift', async () => {
    const shiftId = '123';
    const start = '2025-06-10T08:00:00.000Z';
    const end = '2025-06-10T14:00:00.000Z';

    // Mock datastore query and save behavior
    const queryObj = { kind: 'Shift', filter: jest.fn().mockReturnThis() };
    datastore.key.mockReturnValueOnce({ kind: 'Shift', id: shiftId });
    datastore.createQuery.mockReturnValueOnce(queryObj);
    queryObj.filter.mockReturnThis();
    datastore.runQuery.mockResolvedValueOnce([[]]); // No overlapping shifts
    datastore.save.mockResolvedValueOnce();

    // Make POST request to create shift
    const res = await request(app).post('/shifts').send({
      workerId: 'worker1',
      start,
      end,
    });

    // Assert response and datastore save call
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(shiftId);
    expect(datastore.save).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        workerId: 'worker1',
        duration: 6,
      }),
    }));
  });

  // Test: Creating a shift that overlaps with an existing shift
  it('POST /shifts fails with overlapping shift', async () => {
    const start = '2025-06-10T08:00:00.000Z';
    const end = '2025-06-10T14:00:00.000Z';

    // Mock datastore to return an overlapping shift
    const queryObj = { kind: 'Shift', filter: jest.fn().mockReturnThis() };
    datastore.createQuery.mockReturnValueOnce(queryObj);
    queryObj.filter.mockReturnThis();
    const mockShift = {
      start: '2025-06-10T07:00:00.000Z',
      end: '2025-06-10T09:00:00.000Z',
    };
    mockShift[datastore.KEY] = { id: undefined };
    datastore.runQuery.mockResolvedValueOnce([[mockShift]]);

    // Make POST request to create overlapping shift
    const res = await request(app).post('/shifts').send({
      workerId: 'worker1',
      start,
      end,
    });

    // Assert error response
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/overlaps/);
  });

  // Test: Creating a shift longer than 12 hours
  it('POST /shifts fails with >12 hour shift', async () => {
    const start = '2025-06-10T00:00:00.000Z';
    const end = '2025-06-10T13:00:00.000Z'; // 13 hours

    // Mock datastore to return no overlapping shifts
    const queryObj = { kind: 'Shift', filter: jest.fn().mockReturnThis() };
    datastore.createQuery.mockReturnValueOnce(queryObj);
    queryObj.filter.mockReturnThis();
    datastore.runQuery.mockResolvedValueOnce([[]]);

    // Make POST request to create long shift
    const res = await request(app).post('/shifts').send({
      workerId: 'worker1',
      start,
      end,
    });

    // Assert error response
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/12 hours/);
  });

  // Test: Retrieving all shifts
  it('GET /shifts returns all shifts', async () => {
    // Mock datastore to return a list of shifts
    const queryObj = { kind: 'Shift', filter: jest.fn().mockReturnThis() };
    datastore.createQuery.mockReturnValueOnce(queryObj);
    queryObj.filter.mockReturnThis();
    const shifts = [{
      workerId: 'worker1',
      start: '2025-06-10T08:00:00.000Z',
      end: '2025-06-10T14:00:00.000Z',
      duration: 6,
    }];
    datastore.runQuery.mockResolvedValueOnce([shifts]);

    // Make GET request to retrieve shifts
    const res = await request(app).get('/shifts');

    // Assert successful response
    expect(res.statusCode).toBe(200);
  });
});