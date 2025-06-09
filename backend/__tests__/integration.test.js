const request = require('supertest');
const { app, server } = require('../__tests__/api.test');

afterAll(() => server.close());

describe('Timezone API', () => {
  it('should set and get timezone', async () => {
    await request(app).post('/timezone').send({ timezone: 'America/New_York' }).expect(200);
    const res = await request(app).get('/timezone').expect(200);
    expect(res.body.timezone).toBe('America/New_York');
  });
});

describe('Worker API', () => {
  it('should create and list workers', async () => {
    const createRes = await request(app).post('/workers').send({ name: 'John Doe' }).expect(201);
    expect(createRes.body.name).toBe('John Doe');

    const listRes = await request(app).get('/workers').expect(200);
    expect(listRes.body.length).toBeGreaterThan(0);
  });
});

describe('Shift API', () => {
  it('should create a valid shift', async () => {
    const start = new Date().toISOString();
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // +2 hours
    const res = await request(app).post('/shifts').send({
      workerId: 1,
      start,
      end
    }).expect(201);
    expect(res.body.duration).toBeCloseTo(2.0);
  });

  it('should reject overlapping shift', async () => {
    const start = new Date().toISOString();
    const end = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // +1 hour
    const res = await request(app).post('/shifts').send({
      workerId: 1,
      start,
      end
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('overlaps');
  });
});
