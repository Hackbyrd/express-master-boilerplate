/**
 * Run the worker.js in cluster
 * This is where background jobs are run
 */

'use strict';

// built-in node modules
const fs = require('fs');
const os = require('os');
const path = require('path');

// third-party node modules
const throng = require('throng'); // concurrency
const Queue = require('bull'); // process background tasks from Queue

// ENV variables
const { NODE_ENV, WEB_CONCURRENCY, REDIS_URL } = process.env;
const PROCESSES = NODE_ENV === 'production' ? WEB_CONCURRENCY || os.cpus().length : 1; // number of cores

// variables
const APP_DIR = './app'; // app directory
const PROCESSOR_FILE = 'processor.js'; // the processor file name

// Store all processor routes here
const processorRoutes = [];

// check if is directory and get directories
const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
const directories = getDirectories(path.join(__dirname, APP_DIR));

// require app processor routes
directories.forEach(dir => processorRoutes.push(require(`${dir}/${PROCESSOR_FILE}`)));

// function to start app
async function startWorker(processId) {
  // Print Process Info
  console.log(`process.pid: ${process.pid}`);
  console.log(`process.env.NODE_ENV: ${NODE_ENV}`);

  // run all feature processors
  processorRoutes.forEach(processor => processor());

  // Graceful exit
  process.on('SIGTERM', async () => {
    console.log('Closing GlobalQueue connection...');
    await GlobalQueue.close().catch(err => {
      console.error(err);
      process.exit(1);
    });

    console.log('GlobalQueue connection closed.');
    process.exit(0);
  });
}

// run concurrent workers
throng({
  workers: PROCESSES, // Number of workers (cpu count)
  lifetime: Infinity, // ms to keep cluster alive (Infinity)
  grace: 5000 // ms grace period after worker SIGTERM (5000)
}, startWorker);
