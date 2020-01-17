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
 *   400: Argument Validation Errors.
 *   400: User not found.
 *   401: unauthorized
 *   500: Sequelize Error.
 */
function V1ConfirmPassword(req, callback) {
  const schema = joi.object({
    passwordResetToken: joi.string().required()
  });

  // validate
  const { err, value } = schema.validate(req.args);
  if (err) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, joiErrors(err)));
  req.args = value; // updated arguments with type conversion

  // find admin
  models.admin
    .findOne({
      where: {
        passwordResetToken: req.args.passwordResetToken,
        passwordResetExpire: {
          [Op.gte]: new Date() // has not expired yet
        }
      }
    })
    .then(getAdmin => {
      if (!getAdmin)
        return callback(
          null,
          errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, null, req.__('Invalid password reset token or reset token has expired.'))
        );

      // update new password
      models.admin
        .update(
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
        )
        .then(() => {
          return callback(null, {
            status: 200,
            success: true
          });
        })
        .catch(err => callback(err)); // END update
    })
    .catch(err => callback(err)); // END findOne
} // END confirmPassword
