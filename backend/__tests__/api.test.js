const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { DateTime } = require('luxon');

const app = express();
app.use(bodyParser.json());

// Mock in-memory data
let timezone = 'UTC';
let workers = [];
let shifts = [];
let idCounter = 1;

// Mock timezone
app.get('/timezone', (_, res) => res.json({ timezone }));
app.post('/timezone', (req, res) => {
  timezone = req.body.timezone;
  res.json({ timezone });
});

// Mock workers
app.post('/workers', (req, res) => {
  const w = { id: idCounter++, name: req.body.name };
  workers.push(w);
  res.status(201).json(w);
});
app.get('/workers', (_, res) => res.json(workers));

// Mock shifts
app.post('/shifts', (req, res) => {
  const { workerId, start, end } = req.body;
  const startDT = DateTime.fromISO(start, { zone: timezone });
  const endDT = DateTime.fromISO(end, { zone: timezone });
  const duration = endDT.diff(startDT, 'hours').hours;

  if (endDT <= startDT) return res.status(400).json({ error: 'End must be after start' });
  if (duration > 12) return res.status(400).json({ error: 'Shift exceeds 12 hours' });

  for (const s of shifts) {
    if (s.workerId === workerId) {
      const sStart = DateTime.fromISO(s.start, { zone: timezone });
      const sEnd = DateTime.fromISO(s.end, { zone: timezone });
      if (startDT < sEnd && endDT > sStart) {
        return res.status(400).json({ error: 'Shift overlaps with existing shift' });
      }
    }
  }

  const shift = { id: idCounter++, workerId, start, end, duration };
  shifts.push(shift);
  res.status(201).json(shift);
});

describe('Timezone Shift API', () => {
  it('sets and gets timezone', async () => {
    await request(app).post('/timezone').send({ timezone: 'Asia/Tokyo' });
    const res = await request(app).get('/timezone');
    expect(res.body.timezone).toBe('Asia/Tokyo');
  });

  it('creates and fetches a worker', async () => {
    const res = await request(app).post('/workers').send({ name: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice');
  });

  it('creates a valid shift', async () => {
    const start = DateTime.utc().toISO();
    const end = DateTime.utc().plus({ hours: 4 }).toISO();
    const res = await request(app).post('/shifts').send({ workerId: 1, start, end });
    expect(res.status).toBe(201);
    expect(res.body.duration).toBeCloseTo(4);
  });

  it('rejects overlapping shift', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).toISO();
    const end = DateTime.utc().plus({ hours: 3 }).toISO();
    const res = await request(app).post('/shifts').send({ workerId: 1, start, end });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/overlaps/);
  });
});
