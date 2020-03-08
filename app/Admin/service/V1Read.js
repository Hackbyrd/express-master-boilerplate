/**
 * ADMIN V1Read SERVICE
 */

'use strict';

// ENV variables
const { NODE_ENV, REDIS_URL, ADMIN_CLIENT_HOST } = process.env;

// third-party
const _ = require('lodash');
const Op = require('sequelize').Op; // for operator aliases like $gte, $eq
const io = require('socket.io-emitter')(REDIS_URL); // to emit real-time events to client
const joi = require('@hapi/joi'); // validations
const async = require('async');
const moment = require('moment-timezone');
const passport = require('passport');
const currency = require('currency.js');

// services
const email = require('../../../services/email');
const { SOCKET_ROOMS, SOCKET_EVENTS } = require('../../../services/socket');
const { errorResponse, joiErrorsMessage, ERROR_CODES } = require('../../../services/error');

// models
const models = require('../../../models');

// helpers
const { getOffset, getOrdering, convertStringListToWhereStmt } = require('../../../helpers/cruqd');
const { randomString, createJwtToken } = require('../../../helpers/logic');
const { listIntRegex } = require('../../../helpers/constants');

// methods
module.exports = {
  V1Read
};

/**
 * Read and return an admin
 *
 * GET  /v1/admins/read
 * POST /v1/admins/read
 *
 * Must be logged in
 * Roles: ['admin']
 *
 * req.params = {}
 * req.args = {
 *   id - (NUMBER - OPTIONAL) [DEFAULT - req.admin.id]: The id of an admin
 * }
 *
 * Success: Return a admin.
 * Errors:
 *   400: BAD_REQUEST_INVALID_ARGUMENTS
 *   400: ADMIN_BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST
 *   401: UNAUTHORIZED
 *   500: INTERNAL_SERVER_ERROR
 */
async function V1Read(req, callback) {
  const schema = joi.object({
    id: joi
      .number()
      .min(1)
      .default(req.admin.id)
      .optional()
  });

  // validate
  const { error, value } = schema.validate(req.args);
  if (error)
    return callback(null, errorResponse(req, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, joiErrorsMessage(err)));
  req.args = value; // updated arguments with type conversion

  // find admin
  try {
    const findAdmin = await models.admin.findByPk(req.args.id, {
      attributes: {
        exclude: models.admin.getSensitiveData() // remove sensitive data
      }
    });

    // check if admin exists
    if (!findAdmin)
      return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST));

    return callback(null, {
      status: 200,
      success: true,
      admin: findAdmin.dataValues
    });
  } catch (err) {
    return callback(err);
  }
} // END V1Read
