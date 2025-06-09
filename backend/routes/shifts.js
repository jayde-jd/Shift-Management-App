const express = require('express');
const router = express.Router();
const { DateTime } = require('luxon');
const datastore = require('../services/datastore');
const { getTimezone } = require('../services/timezone');

const SHIFT_KIND = 'Shift';

// Calculates the duration in hours between two ISO date strings
function calculateDuration(startISO, endISO) {
  return (DateTime.fromISO(endISO).toMillis() - DateTime.fromISO(startISO).toMillis()) / 3600000;
}

// Validates a shift for duration and overlap with existing shifts
async function validateShift(workerId, start, end, idToExclude = null) {
  try {
    const duration = calculateDuration(start, end);
    if (duration > 12) throw new Error('Shift exceeds 12 hours');

    // Query all shifts for the worker
    const query = datastore
      .createQuery(SHIFT_KIND);
    const [shifts] = await datastore.runQuery(query);

    if (shifts.length != 0) {
      // Filter shifts for the specific worker
      shifts = shifts.filter(shift => shift.workerId === workerId);
    } else {
      return; // No shifts for this worker, nothing to validate
    }

    // Check for overlapping shifts
    for (const shift of shifts) {
      if (idToExclude && shift[datastore.KEY].id === idToExclude) continue;

      if (
        !(DateTime.fromISO(end) <= DateTime.fromISO(shift.start) ||
          DateTime.fromISO(start) >= DateTime.fromISO(shift.end))
      ) {
        throw new Error('Shift overlaps with an existing one');
      }
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
    await validateShift(workerId, startTz.toISO(), endTz.toISO());

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
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update timezone and convert all existing shifts
router.put('/timezone', async (req, res) => {
  try {
    const { newTimezone } = req.body;
    if (!newTimezone) return res.status(400).json({ error: 'newTimezone is required' });

    // Get all shifts
    const [shifts] = await datastore.runQuery(datastore.createQuery(SHIFT_KIND));
    const updates = [];

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

    // Optionally, update the timezone in your timezone service (if needed)
    if (typeof datastore.setTimezone === 'function') {
      await datastore.setTimezone(newTimezone);
    }
    res.json({ updated: updates.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;