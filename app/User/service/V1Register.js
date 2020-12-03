/**
 * USER V1Register SERVICE
 */

'use strict';

// ENV variables
const { NODE_ENV, REDIS_URL } = process.env;

// third-party
const _ = require('lodash'); // general helper methods: https://lodash.com/docs
const Op = require('sequelize').Op; // for model operator aliases like $gte, $eq
const io = require('socket.io-emitter')(REDIS_URL); // to emit real-time events to client-side applications: https://socket.io/docs/emit-cheatsheet/
const joi = require('@hapi/joi'); // argument validations: https://github.com/hapijs/joi/blob/master/API.md
const Queue = require('bull'); // add background tasks to Queue: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueclean
const moment = require('moment-timezone'); // manage timezone and dates: https://momentjs.com/timezone/docs/
const convert = require('convert-units'); // https://www.npmjs.com/package/convert-units
const slugify = require('slugify'); // convert string to URL friendly string: https://www.npmjs.com/package/slugify
const sanitize = require("sanitize-filename"); // sanitize filename: https://www.npmjs.com/package/sanitize-filename
const passport = require('passport'); // handle authentication: http://www.passportjs.org/docs/
const currency = require('currency.js'); // handling currency operations (add, subtract, multiply) without JS precision issues: https://github.com/scurker/currency.js/
const accounting = require('accounting'); // handle outputing readable format for currency: http://openexchangerates.github.io/accounting.js/

// services
const email = require('../../../services/email');
const { SOCKET_ROOMS, SOCKET_EVENTS } = require('../../../services/socket');
const { ERROR_CODES, errorResponse, joiErrorsMessage } = require('../../../services/error');

// models
const models = require('../../../models');

// helpers
const { getOffset, getOrdering, convertStringListToWhereStmt } = require('../../../helpers/cruqd');
const { randomString } = require('../../../helpers/logic');
const { PASSWORD_LENGTH_MIN, PASSWORD_REGEX, LIST_INT_REGEX } = require('../../../helpers/constants');
const { isValidTimezone } = require('../../../helpers/validate');

// queues
const UserQueue = new Queue('UserQueue', REDIS_URL);

// methods
module.exports = {
  V1Register
}

/**
 * Register a user
 *
 * GET  /v1/users/register
 * POST /v1/users/register
 *
 * Must be logged out
 * Roles: []
 *
 * req.params = {}
 * req.args = {
 *   @firstName - (STRING - REQUIRED): The first name of the new user
 *   @lastName - (STRING - REQUIRED): The last name of the new user
 *   @email - (STRING - REQUIRED): The email of the user,
 *   @timezone - (STRING - REQUIRED): The timezone of the user,
 * }
 *
 * Success: Return a user
 * Errors:
 *   400: BAD_REQUEST_INVALID_ARGUMENTS
 *   400: USER_BAD_REQUEST_TERMS_OF_SERVICE_NOT_ACCEPTED
 *   400: USER_BAD_REQUEST_USER_ALREADY_EXISTS
 *   400: USER_BAD_REQUEST_INVALID_TIMEZONE
 *   401: UNAUTHORIZED
 *   500: INTERNAL_SERVER_ERROR
 */
async function V1Register(req) {
  const schema = joi.object({
    firstName: joi.string().trim().min(1).required(),
    lastName: joi.string().trim().min(1).required(),
    email: joi.string().trim().lowercase().min(3).email().required(),
    timezone: joi.string().min(1).required()
  });

  // validate
  const { error, value } = schema.validate(req.args);
  if (error)
    return Promise.resolve(errorResponse(req, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, joiErrorsMessage(error)));
  req.args = value; // updated arguments with type conversion

  try {
    // check if user email already exists
    const duplicateUser = await models.user.findOne({
      where: {
        email: req.args.email
      }
    });

    // check of duplicate user user
    if (duplicateUser)
      return Promise.resolve(errorResponse(req, ERROR_CODES.USER_BAD_REQUEST_USER_ALREADY_EXISTS));

    // check timezone
    if (!isValidTimezone(req.args.timezone))
      return Promise.resolve(errorResponse(req, ERROR_CODES.USER_BAD_REQUEST_INVALID_TIMEZONE));

    // preparing for reset
    const loginConfirmationToken = randomString();
    const loginConfirmationExpire = moment.tz('UTC').add(1, 'hours'); // add 1 hours from now

    // create user
    const newUser = await models.user.create({
      timezone: req.args.timezone,
      firstName: req.args.firstName,
      lastName: req.args.lastName,
      email: req.args.email,
      loginConfirmationToken: loginConfirmationToken,
      loginConfirmationExpire: loginConfirmationExpire,
      ipAddress: req.ip || req.ips, // get ip address
      password: randomString(), // random password
      acceptedTerms: true
    });
  } catch (error) {
    return Promise.reject(error);
  }

  // grab user without sensitive data
  try {
    const returnUser = await models.user.findByPk(newUser.id, {
      attributes: {
        exclude: models.user.getSensitiveData() // remove sensitive data
      }
    }); // END grab partner without sensitive data

    const loginLink = `${USER_CLIENT_HOST}/settings?email=${req.args.email}&loginConfirmationToken=${loginConfirmationToken}`; // the settings page

    // return
    return Promise.resolve({
      status: 201,
      success: true,
      user: returnUser,
      loginLink: loginLink
    });
  } catch (error) {
    newUser.destroy(); // destroy if error
    return Promise.reject(error);
  }
} // END V1Register
