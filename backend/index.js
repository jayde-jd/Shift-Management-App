// Import the Express framework
const express = require('express');
// Import body-parser to parse incoming JSON requests
const bodyParser = require('body-parser');

// Create an instance of the Express application
const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Mount the timezone routes at /timezone
app.use('/timezone', require('./routes/timezone'));
// Mount the workers routes at /workers
app.use('/workers', require('./routes/workers'));
// Mount the shifts routes at /shifts
app.use('/shifts', require('./routes/shifts'));

// Set the port from environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});