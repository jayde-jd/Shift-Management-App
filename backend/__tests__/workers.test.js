// Mock the datastore and timezone service modules to isolate tests from external dependencies
jest.mock('../services/datastore');
jest.mock('../services/timezone');

const request = require('supertest'); // For HTTP assertions
const express = require('express'); // Express framework
const workerRouter = require('../routes/workers'); // Worker routes
const datastore = require('../services/datastore'); // Mocked datastore service

// Set up an Express app instance for testing
const app = express();
app.use(express.json());
app.use('/workers', workerRouter); // Mount worker routes

describe('Worker API', () => {
  // Test for creating a worker via POST /workers
  it('POST /workers should create a worker', async () => {
    // Mock datastore.key to return a fake key object
    datastore.key.mockReturnValueOnce({ kind: 'Worker', id: '123' });
    // Mock datastore.save to resolve successfully
    datastore.save.mockResolvedValueOnce();

    // Send POST request to create a worker
    const res = await request(app).post('/workers').send({ name: 'Alice' });
    // Assert response status and returned worker ID
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe('123');
  });

  // Test for retrieving workers via GET /workers
  it('GET /workers should return list', async () => {
    // Mock datastore.runQuery to return a list of workers
    datastore.runQuery.mockResolvedValueOnce([[{ name: 'Alice' }]]);
    // Send GET request to fetch workers
    const res = await request(app).get('/workers');
    // Assert response status and returned worker list
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ name: 'Alice' }]);
  });
});