/**
 * ADMIN V1ResetPassword SERVICE
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
  V1ResetPassword
};
/**
 * Reset Password
 *
 * GET  /v1/admins/resetpassword
 * POST /v1/admins/resetpassword
 *
 * Must be logged out
 * Roles: []
 *
 * req.params = {}
 * req.args = {
 *   email - (STRING - REQUIRED): The email of the user
 *   password1 - (STRING - REQUIRED): password 1
 *   password2 - (STRING - REQUIRED): password 2
 * }
 *
 * Success: Return true
 * Errors:
 *   400: BAD_REQUEST_INVALID_ARGUMENTS
 *   400: ADMIN_BAD_REQUEST_INVALID_ARGUMENTS
 *   400: ADMIN_BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST
 *   500: INTERNAL_SERVER_ERROR
 */
async function V1ResetPassword(req, callback) {
  const schema = joi.object({
    email: joi.string().min(3).email().required(),
    password1: joi.string().min(8).required(),
    password2: joi.string().min(8).required()
  });

  // validate
  const { error, value } = schema.validate(req.args);
  if (error)
    return callback(null, errorResponse(req, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, joiErrorsMessage(err)));

  // check password1 and password2 equality
  const msg = checkPasswords(req.args.password1, req.args.password2, 8);
  if (msg !== true)
    return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, req.__(msg)));

  // grab admin with this email
  try {
    const findAdmin = await models.admin.findOne({
      where: {
        email: req.args.email
      }
    });

    // if admin cannot be found
    if (!findAdmin)
      return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST));

    // hash new password
    const newPassword = bcrypt.hashSync(req.args.password1, findAdmin.salt);

    // preparing for reset
    const passwordResetToken = randomString();
    const passwordResetExpire = moment.tz('UTC').add(6, 'hours'); // add 6 hours from now
    req.args.password = newPassword; // set hashed password

    // update admin
    await models.admin.update({
      resetPassword: req.args.password,
      passwordResetToken: passwordResetToken,
      passwordResetExpire: passwordResetExpire
    }, {
      fields: ['resetPassword', 'passwordResetToken', 'passwordResetExpire'], // only these fields
      where: {
        email: req.args.email
      }
    });

    const resetLink = `${ADMIN_CLIENT_HOST}/confirm-password?passwordResetToken=${passwordResetToken}`; // create URL using front end url

    // send confirmation email
    email.mail({
      from: email.emails.support.address,
      name: email.emails.support.name,
      subject: 'Your password has been changed. Please confirm.',
      template: 'AdminResetPassword',
      tos: [req.args.email],
      ccs: null,
      bccs: null,
      args: {
        resetPasswordConfirmationLink: resetLink,
        expires: '6 hours'
      }
    }, (err, result) => {
      if (err)
        return callback(err);

      // return success
      return callback(null, {
        status: 200,
        success: true,
        message: 'An email has been sent to ' + req.args.email + '. Please check your email to confirm your new password change.',
        resetLink: NODE_ENV === 'test' ? resetLink : null // only return reset link in dev and test env for testing purposes
      });
    }); // END send email
  } catch (err) {
    return callback(err);
  }
} // END V1ResetPassword
