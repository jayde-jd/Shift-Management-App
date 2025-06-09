const express = require('express');
const router = express.Router();
const datastore = require('../services/datastore');

const WORKER_KIND = 'Worker';

// Create a new worker
router.post('/', async (req, res) => {
  try {
    const worker = {
      name: req.body.name,
    };
    const key = datastore.key([WORKER_KIND]);
    await datastore.save({ key, data: worker });
    res.json({ id: key.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all workers
router.get('/', async (req, res) => {
  try {
    const [workers] = await datastore.runQuery(datastore.createQuery(WORKER_KIND));
    const workersWithId = workers.map(worker => ({
      id: worker[datastore.KEY].id,
      ...worker
    }));
    res.json(workersWithId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a worker by ID
router.put('/:id', async (req, res) => {
  try {
    const key = datastore.key([WORKER_KIND, datastore.int(req.params.id)]);
    const [existing] = await datastore.get(key);
    if (!existing) return res.status(404).json({ error: 'Worker not found' });

    existing.name = req.body.name;
    await datastore.save({ key, data: existing });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a worker by ID
router.delete('/:id', async (req, res) => {
  try {
    const key = datastore.key([WORKER_KIND, datastore.int(req.params.id)]);
    await datastore.delete(key);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;