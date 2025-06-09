/**
 * Mock implementation of a Datastore client for testing purposes.
 *
 * @typedef {Object} datastore
 * @property {function([string, string|number]): {kind: string, id: string|number}} key - Mocks the creation of a datastore key.
 * @property {function(number|string): number} int - Converts a value to an integer.
 * @property {jest.Mock} get - Mock function for retrieving an entity.
 * @property {jest.Mock} save - Mock function for saving an entity.
 * @property {jest.Mock} upsert - Mock function for upserting an entity.
 * @property {jest.Mock} delete - Mock function for deleting an entity.
 * @property {jest.Mock} runQuery - Mock function for running a query.
 * @property {function(string): {kind: string, filter: jest.Mock}} createQuery - Mocks the creation of a query object.
 * @property {string} KEY - Mock constant representing a datastore key symbol.
 */
const datastore = {
  key: jest.fn(([kind, id]) => ({ kind, id })),
  int: (value) => parseInt(value),
  get: jest.fn(),
  save: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  runQuery: jest.fn(),
  createQuery: jest.fn((kind) => ({
    kind,
    filter: jest.fn().mockReturnThis(),
  })),
  KEY: 'KEY',
};

module.exports = datastore;