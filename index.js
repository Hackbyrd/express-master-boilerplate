/**
 * Run the server and cluster. Main entry point
 */

'use strict';

// built-in node modules
const os = require('os');

// third-party node modules
const throng = require('throng'); // concurrency

// env variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
const PROCESSES = NODE_ENV === 'production' ? process.env.WEB_CONCURRENCY || os.cpus().length : 1; // number of cores

// function to start app
async function startApp(processId) {
  const models = require('./models'); // get models
  const { gracefulExit } = require('./middleware/exit'); // exit

  // create server
  const server = require('./server'); // get app
  console.log(`process.env.NODE_ENV: ${NODE_ENV}`);

  try {

    // to check if database connection is established
    await models.db.authenticate();

    // listen server
    server.listen(PORT, async () => {
      console.log(`Process ID: ${processId} - Server started on port ${PORT}`);

      // on terminate command: killall node
      process.on('SIGTERM', async () => {
        console.log(`Process ${processId} exiting...`);

        try {
          // remove database connections gracefully
          await models.db.close();
          console.log('Database Connection Closed');

          // gracefully exit server
          gracefulExit(server);
        } catch (error) {
          console.log(error);
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

// run concurrent workers
throng(
  {
    workers: PROCESSES, // Number of workers (cpu count)
    lifetime: Infinity, // ms to keep cluster alive (Infinity)
    grace: 5000 // ms grace period after worker SIGTERM (5000)
  },
  startApp
);
