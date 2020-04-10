/**
 * ADMIN BACKGROUND PROCESSOR
 *
 * This is where we process background tasks for the Admin feature.
 * Gets exported to /worker.js to be run in a worker process.
 */

'use strict';

// built-in node modules
const path = require('path');

// ENV variables
const { REDIS_URL } = process.env;

// third party node modules
const Queue = require('bull'); // process background tasks from Queue
const AdminQueue = new Queue('AdminQueue', REDIS_URL);

// Function is called in /worker.js
// Returns an array of Queues used in this feature so we can gracefully close them in worker.js
module.exports = () => {

  // Process Admin Feature Background Tasks
  AdminQueue.process('V1ExportTask', 1, path.join(__dirname, 'tasks/V1ExportTask.js'));

  // future tasks below

  // return array of queues to worker.js to gracefully close them
  return [AdminQueue];
}
