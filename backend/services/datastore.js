/**
 * Imports the Datastore class from the @google-cloud/datastore package.
 * This class is used to interact with Google Cloud Datastore, a NoSQL document database.
 *
 * @see {@link https://cloud.google.com/datastore/docs/reference/libraries}
 */
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
module.exports = datastore;