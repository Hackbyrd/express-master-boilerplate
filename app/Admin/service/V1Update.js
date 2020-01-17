/**
 * ADMIN V1Update SERVICE
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

// services
const email = require('../../../services/email');

// models
const models = require('../../../models');

//helpers
const { getOffset, getOrdering, convertStringListToWhereStmt } = require('../../../helpers/cruqd');
const { errRes, joiErrors, ERROR_CODES } = require('../../../helpers/error');
const { randomString, createJwtToken } = require('../../../helpers/logic');
const { checkPasswords, isValidTimezone } = require('../../../helpers/validate');
const { listIntRegex } = require('../../../helpers/constants');

// methods
module.exports = {
  V1Update
};

/**
 * Update and return updated admin
 *
 * GET  /v1/admins/update
 * POST /v1/admins/update
 *
 * Must be logged in
 * Roles: ['admin']
 *
 * req.params = {}
 * req.args = {
 *   timezone - (STRING - OPTIONAL): the timezone of the admin
 *   locale - (STRING - OPTIONAL): The language of the user
 *   name - (STRING - OPTIONAL): the name of the admin
 *   phone - (STRING - OPTIONAL): the phone
 * }
 *
 * Success: Return a admin.
 * Errors:
 *   400: Argument Validation Errors.
 *   400: Admin not found.
 *   401: unauthorized
 *   500: Sequelize Error.
 */
function V1Update(req, callback) {
  const schema = joi.object({
    timezone: joi
      .string()
      .trim()
      .optional(),
    locale: joi
      .string()
      .trim()
      .optional(),
    name: joi
      .string()
      .trim()
      .optional(),
    phone: joi
      .string()
      .trim()
      .optional()
  });

  // validate
  const { err, value } = schema.validate(req.args);
  if (err) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, joiErrors(err)));

  // updated arguments with type conversion
  const oldArgs = req.args;
  req.args = value;

  // check timezone
  if (req.args.timezone && !isValidTimezone(req.args.timezone))
    return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, req.__('Time zone is invalid.')));

  // update admin
  models.admin
    .update(req.args, {
      where: {
        id: req.admin.id
      }
    })
    .then(() => {
      // grab updated admin
      return models.admin.findByPk(req.admin.id, {
        attributes: {
          exclude: models.admin.getSensitiveData() // remove sensitive data
        }
      });
    })
    .then(getAdmin => {
      return callback(null, {
        status: 200,
        success: true,
        admin: getAdmin.dataValues
      });
    })
    .catch(err => callback(err)); // END update
} // END V1Update
