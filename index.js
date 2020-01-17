/**
 * Run the server and cluster. Main entry point
 */

'use strict';

// built-in node modules
const os = require('os');

// require third-party node modules
const throng = require('throng'); // concurrency

// env variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
const PROCESSES = NODE_ENV === 'production' ? process.env.WEB_CONCURRENCY || os.cpus().length : 1; // number of cores

// function to start app
function startApp(processId) {
  const models = require('./models'); // get models

  // create server
  const server = require('./server'); // get app

  // exit
  const { gracefulExit } = require('./middleware/exit');

  console.log(`process.env.NODE_ENV: ${NODE_ENV}`);

  // to check if database connection is established
  models.db
    .authenticate()
    .then(() => {
      // listen server
      server.listen(PORT, () => {
        console.log(`Process ID: ${processId} - Server started on port ${PORT}`);

        // on terminate command: killall node
        process.on('SIGTERM', () => {
          console.log(`Process ${processId} exiting...`);

          // remove database connections gracefully
          models.db
            .close()
            .then(() => {
              console.log('Database Connection Closed');

              // gracefully exit server
              gracefulExit(server);
            })
            .catch(err => {
              console.log(err);
              process.exit(1);
            });
        });
      });
    })
    .catch(err => {
      console.log(err);
      process.exit(1);
    }); // end authenticate
  return false;
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
