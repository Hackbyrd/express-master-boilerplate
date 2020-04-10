/**
 * Admin Background Jobs Processor:
 *
 * This is where we process background tasks for Admin feature.
 * Gets exported to /worker.js
 */

'use strict';

// built-in node modules
const path = require('path');

// ENV variables
const { REDIS_URL } = process.env;

// third party node modules
const Queue = require('bull'); // process background tasks from Queue
const AdminQueue = new Queue('AdminQueue', REDIS_URL);

// call this function in worker.js
function processor() {

  // Process Background Tasks
  AdminQueue.process('V1ExportTask', 1, path.join(__dirname, 'tasks/V1ExportTask.js'));

  // future tasks below
}

module.exports = processor;
