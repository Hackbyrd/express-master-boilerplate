/**
 * ADMIN V1ConfirmPassword SERVICE
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
const { checkPasswords, isValidTimezone } = require('../../../helpers/validate');
const { listIntRegex } = require('../../../helpers/constants');

// methods
module.exports = {
  V1ConfirmPassword
};

/**
 * Confirm password
 *
 * GET  /v1/admins/confirmpassword
 * POST /v1/admins/confirmpassword
 *
 * Can be logged in or logged out
 * Roles: []
 *
 * req.params = {}
 * req.args = {
 *   passwordResetToken - (STRING - REQUIRED): The password reset token to confirm new password
 * }
 *
 * Success: Return a admin and JWT.
 * Errors:
 *   400: BAD_REQUEST_INVALID_ARGUMENTS
 *   400: ADMIN_BAD_REQUEST_INVALID_ARGUMENTS
 *   401: UNAUTHORIZED
 *   500: INTERNAL_SERVER_ERROR.
 */
async function V1ConfirmPassword(req, callback) {
  const schema = joi.object({
    passwordResetToken: joi.string().required()
  });

  // validate
  const { err, value } = schema.validate(req.args);
  if (err) return callback(null, errorResponse(req, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, joiErrorsMessage(err)));

  req.args = value; // updated arguments with type conversion

  try {
    // grab admin
    const getAdmin = await models.admin.findOne({
      where: {
        passwordResetToken: req.args.passwordResetToken,
        passwordResetExpire: {
          [Op.gte]: new Date() // has not expired yet
        }
      }
    });

    // if admin does not exists
    if (!getAdmin) {
      return callback(
        null,
        errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, req.__('Invalid password reset token or reset token has expired.'))
      );
    }

    // update new password
    await models.admin.update(
      {
        password: getAdmin.resetPassword, // set to resetPassword
        resetPassword: null,
        passwordResetToken: null
      },
      {
        fields: ['password', 'resetPassword', 'passwordResetToken'], // only these fields
        where: {
          id: getAdmin.id
        }
      }
    );

    // return success
    return callback(null, {
      status: 200,
      success: true
    });
  } catch (err) {
    return callback(err);
  }
} // END confirmPassword
