/**
 * ADMIN V1UpdatePassword SERVICE
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
const bcrypt = require('bcrypt');
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
  V1UpdatePassword
};

/**
 * Update password of admin
 *
 * GET  /v1/admins/updatepassword
 * POST /v1/admins/updatepassword
 *
 * Must be logged in
 * Roles: ['admin']
 *
 * req.params = {}
 * req.args = {
 *   password - (STRING - REQUIRED): the current password
 *   password1 - (STRING - REQUIRED): password 1
 *   password2 - (STRING - REQUIRED): password 2
 * }
 *
 * Success: Return a true.
 * Errors:
 *   400: BAD_REQUEST_INVALID_ARGUMENTS
 *   500: INTERNAL_SERVER_ERROR
 */
function V1UpdatePassword(req, callback) {
  const schema = joi.object({
    password: joi
      .string()
      .min(8)
      .required(),
    password1: joi
      .string()
      .min(8)
      .required(),
    password2: joi
      .string()
      .min(8)
      .required()
  });

  // validate
  const { err, value } = schema.validate(req.args);
  if (err) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, joiErrors(err)));

  // check password1 and password2 equality
  const msg = checkPasswords(req.args.password1, req.args.password2, 8);
  if (msg !== true) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, req.__(msg)));

  // check password
  models.admin.validatePassword(req.args.password, req.admin.password, (err, result) => {
    if (err) return callback(err);

    // if password is incorrect
    if (!result)
      return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, req.__('Original password is incorrect, please try again.')));

    // hash new password
    const newPassword = bcrypt.hashSync(req.args.password1, req.admin.salt);

    models.admin
      .update(
        {
          password: newPassword
        },
        {
          fields: ['password'], // only these fields
          where: {
            id: req.admin.id
          }
        }
      )
      .then(() => {
        // return success
        return callback(null, {
          status: 200,
          success: true
        });
      })
      .catch(err => callback(err)); // END update admin
  }); // END validPassword
} // END V1UpdatePassword
