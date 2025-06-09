const express = require('express');
const router = express.Router();
const { getTimezone, setTimezone } = require('../services/timezone');

// GET endpoint to retrieve the current timezone setting
router.get('/', async (req, res) => {
  const tz = await getTimezone();
  res.json({ timezone: tz });
});

// POST endpoint to update the timezone setting
router.post('/', async (req, res) => {
  const { timezone } = req.body;
  try {
    await setTimezone(timezone);
    res.json({ success: true });
  } catch {
    // Return error if the timezone is invalid or setting fails
    res.status(400).json({ error: 'Invalid timezone' });
  }
});

module.exports = router;