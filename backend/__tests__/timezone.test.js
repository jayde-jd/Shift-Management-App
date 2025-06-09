// Mock the datastore and timezone service modules
jest.mock('../services/datastore');
jest.mock('../services/timezone');

const request = require('supertest');
const express = require('express');
const timezoneRouter = require('../routes/timezone');
const datastore = require('../services/datastore');

// Set up Express app and mount the timezone router
const app = express();
app.use(express.json());
app.use('/timezone', timezoneRouter);

describe('Timezone API', () => {
  // Test the GET /timezone endpoint for default value
  it('GET /timezone should return default "UTC"', async () => {
    // Mock datastore.get to return [null], simulating no value set
    datastore.get.mockResolvedValueOnce([null]);
    const res = await request(app).get('/timezone');
    expect(res.statusCode).toBe(200);
  });

  // Test the POST /timezone endpoint for updating timezone
  it('POST /timezone should update timezone', async () => {
    // Mock datastore.upsert to resolve successfully
    datastore.upsert.mockResolvedValueOnce();
    const res = await request(app)
      .post('/timezone')
      .send({ timezone: 'America/New_York' });
    expect(res.statusCode).toBe(200);
  });
});