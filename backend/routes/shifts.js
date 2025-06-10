const express = require('express');
const router = express.Router();
const { DateTime } = require('luxon');
const datastore = require('../services/datastore');
const { getTimezone, setTimezone } = require('../services/timezone');

const SHIFT_KIND = 'Shift';

// Calculates the duration in hours between two ISO date strings
function calculateDuration(startISO, endISO) {
  return (DateTime.fromISO(endISO).toMillis() - DateTime.fromISO(startISO).toMillis()) / 3600000;
}

// Validates a shift for duration and overlap with existing shifts
async function validateShift(workerId, start, end, idToExclude = null) {
  try {
    let errors = [];
    const duration = calculateDuration(start, end);
    if (duration > 12) {
      errors.push({ message: 'Shift cannot be longer than 12 hours' });
      return errors;
    }

    // Query all shifts for the worker
    const query = datastore
      .createQuery(SHIFT_KIND);
    let [shifts] = await datastore.runQuery(query);

    if (Array.isArray(shifts) && shifts.length != 0) {
      let shiftDuration = 0;
      // Filter shifts for the specific worker
      shifts = shifts.filter(shift => shift.workerId === workerId);

      // Check for overlapping shifts
      for (const shift of shifts) {
        if (idToExclude && shift[datastore.KEY].id === idToExclude) continue; // Skip the shift being updated
        
        shiftDuration += calculateDuration(shift.start, shift.end);
        if (
          !(DateTime.fromISO(end) <= DateTime.fromISO(shift.start) ||
            DateTime.fromISO(start) >= DateTime.fromISO(shift.end))
        ) {
          errors.push({ message: 'Shift overlaps with existing shift' });
          return errors;
        }
      }
      // Check total duration for the worker
      if (shiftDuration + duration > 12) {
        errors.push({ message: 'Total shift duration for worker cannot exceed 12 hours' });
        return errors;
      }
    } else {
      return []; // No shifts for this worker, nothing to validate
    }
  } catch (err) {
    throw err;
  }
}

// Create a new shift
router.post('/', async (req, res) => {
  try {
    const { workerId, start, end } = req.body;
    // Get timezone and convert start/end to that zone
    const tz = await getTimezone();
    const startTz = DateTime.fromISO(start, { zone: tz });
    const endTz = DateTime.fromISO(end, { zone: tz });

    // Validate shift for duration and overlap
    const validate = await validateShift(workerId, startTz.toISO(), endTz.toISO());

    if (Array.isArray(validate) && validate.length > 0) {
      return res.status(400).json({ errors: validate });
    }

    const duration = calculateDuration(startTz.toISO(), endTz.toISO());

    // Prepare shift object
    const shift = {
      workerId,
      start: startTz.toISO(),
      end: endTz.toISO(),
      duration,
    };

    // Save shift to datastore
    const key = datastore.key([SHIFT_KIND]);
    await datastore.save({ key, data: shift });
    res.json({ id: key.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all shifts
router.get('/', async (req, res) => {
  try {
    const [shifts] = await datastore.runQuery(datastore.createQuery(SHIFT_KIND));
    const shiftsWithId = shifts.map(shift => ({
      id: shift[datastore.KEY].id,
      ...shift,
    }));
    res.json(shiftsWithId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update timezone and convert all existing shifts
router.put('/timezone', async (req, res) => {
  try {
    const { newTimezone } = req.body;
    if (!newTimezone) return res.status(400).json({ error: 'Timezone is required' });

    // Get all shifts
    const [shifts] = await datastore.runQuery(datastore.createQuery(SHIFT_KIND));
    const updates = [];

    if (Array.isArray(shifts) && shifts.length > 0) {
      for (const shift of shifts) {
        const key = shift[datastore.KEY];
        // Convert start/end to new timezone, keeping the same UTC instant
        const startUtc = DateTime.fromISO(shift.start).toUTC();
        const endUtc = DateTime.fromISO(shift.end).toUTC();
        const startTz = startUtc.setZone(newTimezone).toISO();
        const endTz = endUtc.setZone(newTimezone).toISO();
        updates.push({
          key,
          data: {
            ...shift,
            start: startTz,
            end: endTz,
          },
        });
      }
      // Batch update all shifts
      if (updates.length > 0) await datastore.save(updates);

      await setTimezone(newTimezone); // Update the timezone setting

      res.json({ success: true, updated: updates.length });
    } else {
      await setTimezone(newTimezone);
      res.json({ success: true, message: 'Timezone update only' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a shift by ID
router.delete('/:id', async (req, res) => {
  try {
    const key = datastore.key([SHIFT_KIND, datastore.int(req.params.id)]);
    await datastore.delete(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a shift by ID
router.put('/:id', async (req, res) => {
  try {
    const { workerId, start, end } = req.body;
    const key = datastore.key([SHIFT_KIND, datastore.int(req.params.id)]);
    const [existing] = await datastore.get(key);
    if (!existing) return res.status(404).json({ error: 'Shift not found' });

    // Get timezone and convert start/end to that zone
    const tz = await getTimezone();
    const startTz = DateTime.fromISO(start, { zone: tz });
    const endTz = DateTime.fromISO(end, { zone: tz });

    // Validate shift for duration and overlap
    const validate = await validateShift(workerId, startTz.toISO(), endTz.toISO(), req.params.id);

    if (Array.isArray(validate) && validate.length > 0) {
      return res.status(400).json({ errors: validate });
    }

    const duration = calculateDuration(startTz.toISO(), endTz.toISO());

    // Update shift object
    existing.workerId = workerId;
    existing.start = startTz.toISO();
    existing.end = endTz.toISO();
    existing.duration = duration;

    // Save updated shift
    await datastore.save({ key, data: existing });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;