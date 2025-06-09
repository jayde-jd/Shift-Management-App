// Dependencies
require('dotenv').config({ path: '../.env' });

const express = require('express');
const bodyParser = require('body-parser');
const { Datastore } = require('@google-cloud/datastore');
const { DateTime } = require('luxon');

const app = express();
app.use(bodyParser.json());

const datastore = new Datastore();
const SETTINGS_KEY = datastore.key(['Settings', 'default']);

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'UTC';

// Utility to get preferred timezone
async function getTimezone() {
  const [setting] = await datastore.get(SETTINGS_KEY);
  return setting?.timezone || DEFAULT_TZ;
}

// 1. Timezone endpoint
app.get('/timezone', async (req, res) => {
  const [setting] = await datastore.get(SETTINGS_KEY);
  res.json({ timezone: setting?.timezone || DEFAULT_TZ });
});

app.post('/timezone', async (req, res) => {
  const { timezone } = req.body;
  await datastore.save({ key: SETTINGS_KEY, data: { timezone } });
  res.status(200).json({ timezone });
});

// 2. Workers CRUD
app.post('/workers', async (req, res) => {
  const { name } = req.body;
  const key = datastore.key(['Worker']);
  const worker = { key, data: { name } };
  await datastore.save(worker);
  res.status(201).json({ id: key.id, name });
});

app.get('/workers', async (req, res) => {
  const [workers] = await datastore.runQuery(datastore.createQuery('Worker'));
  res.json(workers);
});

app.put('/workers/:id', async (req, res) => {
  const key = datastore.key(['Worker', parseInt(req.params.id)]);
  const { name } = req.body;
  await datastore.save({ key, data: { name } });
  res.status(200).json({ id: req.params.id, name });
});

app.delete('/workers/:id', async (req, res) => {
  const key = datastore.key(['Worker', parseInt(req.params.id)]);
  await datastore.delete(key);
  res.status(204).send();
});

// 3. Shifts CRUD with validation
app.post('/shifts', async (req, res) => {
  const timezone = await getTimezone();
  const { workerId, start, end } = req.body;
  const startDT = DateTime.fromISO(start, { zone: timezone });
  const endDT = DateTime.fromISO(end, { zone: timezone });

  if (endDT <= startDT) return res.status(400).json({ error: 'End must be after start' });
  const duration = endDT.diff(startDT, 'hours').hours;
  if (duration > 12) return res.status(400).json({ error: 'Shift exceeds 12 hours' });

  const query = datastore.createQuery('Shift').filter('workerId', '=', workerId);
  const [existingShifts] = await datastore.runQuery(query);

  for (let shift of existingShifts) {
    const s = DateTime.fromISO(shift.start, { zone: timezone });
    const e = DateTime.fromISO(shift.end, { zone: timezone });
    if (startDT < e && endDT > s) {
      return res.status(400).json({ error: 'Shift overlaps with existing shift' });
    }
  }

  const key = datastore.key('Shift');
  await datastore.save({
    key,
    data: {
      workerId,
      start: startDT.toISO(),
      end: endDT.toISO(),
      duration
    }
  });
  res.status(201).json({ id: key.id, workerId, start: startDT.toISO(), end: endDT.toISO(), duration });
});

app.get('/shifts', async (req, res) => {
  const timezone = await getTimezone();
  const [shifts] = await datastore.runQuery(datastore.createQuery('Shift'));
  const mapped = shifts.map(s => {
    const start = DateTime.fromISO(s.start, { zone: timezone });
    const end = DateTime.fromISO(s.end, { zone: timezone });
    return {
      ...s,
      start: start.toISO(),
      end: end.toISO(),
      duration: end.diff(start, 'hours').hours
    };
  });
  res.json(mapped);
});

app.put('/shifts/:id', async (req, res) => {
  const shiftId = parseInt(req.params.id);
  const timezone = await getTimezone();
  const { workerId, start, end } = req.body;
  const startDT = DateTime.fromISO(start, { zone: timezone });
  const endDT = DateTime.fromISO(end, { zone: timezone });
  const duration = endDT.diff(startDT, 'hours').hours;

  if (duration > 12) return res.status(400).json({ error: 'Shift exceeds 12 hours' });

  const query = datastore.createQuery('Shift').filter('workerId', '=', workerId);
  const [existingShifts] = await datastore.runQuery(query);

  for (let shift of existingShifts) {
    if (shift[datastore.KEY].id === shiftId) continue;
    const s = DateTime.fromISO(shift.start, { zone: timezone });
    const e = DateTime.fromISO(shift.end, { zone: timezone });
    if (startDT < e && endDT > s) {
      return res.status(400).json({ error: 'Shift overlaps with existing shift' });
    }
  }

  const key = datastore.key(['Shift', shiftId]);
  await datastore.save({
    key,
    data: { workerId, start: startDT.toISO(), end: endDT.toISO(), duration }
  });
  res.status(200).json({ id: shiftId, workerId, start: startDT.toISO(), end: endDT.toISO(), duration });
});

app.delete('/shifts/:id', async (req, res) => {
  const key = datastore.key(['Shift', parseInt(req.params.id)]);
  await datastore.delete(key);
  res.status(204).send();
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server };