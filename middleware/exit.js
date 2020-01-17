/**
 * Middleware for graceful exit
 */

'use strict';

const { NODE_ENV } = process.env; // get node env

let isShuttingDown = false; // whether is shutting down or not

/**
 * Make sure for any type of request (POST or GET), the parameters are stored in req.args
 * req.body store arguments from POST body and req.query store URL params
 * req.args store which ever one was used
 */
module.exports = {
  gracefulExit,
  middleware
};

function gracefulExit(server) {
  // if already shutting down
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log('Received kill signal (SIGTERM), shutting down...');

  // force close after 30 seconds
  setTimeout(() => {
    console.log('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);

  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });
}

/**
 * Stops new incoming requests while the server is shutting down
 */
function middleware(req, res, next) {
  // if not shutting down, continue
  if (!isShuttingDown) return next();

  res.set('Connection', 'close');
  return res.status(503).send('Server is in the process of shutting down or restarting.');
}
