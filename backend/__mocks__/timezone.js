/**
 * Mock module for the timezone service.
 * 
 * This mock uses the actual implementation of the '../services/timezone' module.
 * Useful for tests where the real timezone logic is required instead of a stub.
 */
module.exports = require.requireActual('../services/timezone');