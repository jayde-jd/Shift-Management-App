const express = require('express');
const router = express.Router();
const datastore = require('../services/datastore');

const WORKER_KIND = 'Worker';

// Create a new worker
router.post('/', async (req, res) => {
  const worker = {
    name: req.body.name,
  };
  const key = datastore.key([WORKER_KIND]);
  await datastore.save({ key, data: worker });
  res.json({ id: key.id });
});

// Get all workers
router.get('/', async (req, res) => {
  const [workers] = await datastore.runQuery(datastore.createQuery(WORKER_KIND));
  res.json(workers);
});

// Update a worker by ID
router.put('/:id', async (req, res) => {
  const key = datastore.key([WORKER_KIND, datastore.int(req.params.id)]);
  const [existing] = await datastore.get(key);
  if (!existing) return res.status(404).json({ error: 'Worker not found' });

  existing.name = req.body.name;
  await datastore.save({ key, data: existing });
  res.json({ success: true });
});

// Delete a worker by ID
router.delete('/:id', async (req, res) => {
  const key = datastore.key([WORKER_KIND, datastore.int(req.params.id)]);
  await datastore.delete(key);
  res.json({ success: true });
});

module.exports = router;