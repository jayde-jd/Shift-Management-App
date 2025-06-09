const datastore = require('./datastore');

// Key used to store/retrieve the timezone setting from the datastore
const TIMEZONE_KEY = datastore.key(['Setting', 'Timezone']);

/**
 * Retrieves the current timezone setting from the datastore.
 * @returns {Promise<string>} The stored timezone value, or 'UTC' if not set.
 */
async function getTimezone() {
  const [setting] = await datastore.get(TIMEZONE_KEY);
  return setting?.value ?? 'UTC';
}

/**
 * Updates or creates the timezone setting in the datastore.
 * @param {string} tz - The timezone value to set.
 * @returns {Promise<void>}
 */
async function setTimezone(tz) {
  const entity = {
    key: TIMEZONE_KEY,
    data: { value: tz },
  };
  await datastore.upsert(entity);
}

module.exports = { getTimezone, setTimezone };