/**
 * Main Express Application: set up express app
 */

'use strict';

// require third-party node modules
const express = require('express');
const sslRedirect = require('heroku-ssl-redirect');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const helmet = require('helmet');
const http = require('http');
const cors = require('cors'); // handle cors
const i18n = require('i18n'); // set up language

// env variables
const { NODE_ENV, REDIS_URL } = process.env;

// helpers
const { LOCALES } = require('./helpers/constants');

// server
function server() {
  // require custom
  const models = require('./models'); // establish and grab db connection
  const cfgPassport = require('./services/passport'); // configuration for passport

  // require custom middleware
  const args = require('./middleware/args');
  const error = require('./middleware/error');
  const exit = require('./middleware/exit');
  const { attachJWTAuth } = require('./middleware/auth');

  // set up express app
  const app = express();
  const newServer = http.createServer(app);
  const io = require('socket.io')(newServer); // socket.io

  // set up redis with socket
  const redis = require('socket.io-redis');
  const socket = require('./services/socket'); // require socket service to initiate socket.io
  io.adapter(redis(REDIS_URL));

  // enable ssl redirect in production
  app.use(sslRedirect());

  // only log requests in development
  NODE_ENV === 'development' ? app.use(require('morgan')('dev')) : null;

  // add middleware and they must be in order
  app.use(compression()); // GZIP all assets
  app.use(cors()); // handle cors
  app.use(helmet()); // protect against vulnerabilities
  // app.use(rawBody); // adds rawBody to req object

  // set up language
  i18n.configure({
    locales: LOCALES, // set the languages here
    defaultLocale: LOCALES[0], // default is the first index
    queryParameter: 'lang', // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    cookie: 'i18n-locale', // if you change cookie name, you must also change in verifyJWTAuth res.cookie
    directory: __dirname + '/locales'
  });

  // you will need to use cookieParser to expose cookies to req.cookies
  app.use(cookieParser());

  // i18n init parses req for language headers, cookies, etc.
  // NOTE: If user is logged in, locale is set in verifyJWTAuth method
  app.use(i18n.init);

  // save raw body
  function rawBodySaver(req, res, buf, encoding) {
    if (buf && buf.length)
      req.rawBody = buf.toString(encoding || 'utf8');
  }

  // body parser
  app.use(bodyParser.json({ limit: '32mb', verify: rawBodySaver })); // raw application/json
  app.use(bodyParser.urlencoded({ limit: '32mb', verify: rawBodySaver, extended: false })); // application/x-www-form-urlencoded

  // NOTE: take this out because it interferes with multer
  // app.use(bodyParser.raw({ limit: '32mb', verify: rawBodySaver, type: () => true }));

  // only secure in production
  if (NODE_ENV === 'production')
    app.set('trust proxy', 1); // get ip address using req.ip

  // passport config, must be in this order!
  app.use(passport.initialize());
  cfgPassport(passport); // set up passport

  // custom middleware
  app.use(args.attach); // set req.args
  app.use(attachJWTAuth(passport));
  app.use(exit.middleware); // stops here if server is in the middle of shutting down

  // host public files
  // app.use(express.static(__dirname + '/public'));

  // set up routes
  const router = require('./routes')(passport); // grab routes
  app.use('/', router); // place routes here

  // error middleware MUST GO LAST
  app.use(error);

  // io connection, call socket.connect
  io.on('connection', socket.connect);

  // return newServer
  return newServer;
}

module.exports = server(); // return server app for testing
