/**
 * ADMIN V1Create SERVICE
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
const { LIST_INT_REGEX } = require('../../../helpers/constants');

// methods
module.exports = {
  V1Create
};

/**
 * Create an admin
 *
 * GET  /v1/admins/create
 * POST /v1/admins/create
 *
 * Must be logged in
 * Roles: ['admin']
 *
 * req.params = {}
 * req.args = {
 *   name - (STRING - REQUIRED): The name of the new admin
 *   active - (BOOLEAN - REQUIRED): Whether admin is active or not
 *   email - (STRING - REQUIRED): The email of the admin,
 *   phone - (STRING - REQUIRED): The phone of the admin,
 *   timezone - (STRING - REQUIRED): The timezone of the admin,
 *   locale - (STRING - REQUIRED): The language of the user
 *   password1 - (STRING - REQUIRED): The unhashed password1 of the admin
 *   password2 - (STRING - REQUIRED): The unhashed password2 of the admin
 *   acceptedTerms - (BOOLEAN - REQUIRED): Whether terms is accepted or not
 * }
 *
 * Success: Return an admin
 * Errors:
 *   400: BAD_REQUEST_INVALID_ARGUMENTS
 *   400: ADMIN_BAD_REQUEST_INVALID_ARGUMENTS
 *   401: UNAUTHORIZED
 *   500: INTERNAL_SERVER_ERROR
 */
async function V1Create(req, callback) {
  const schema = joi.object({
    name: joi.string().trim().min(1).required(),
    active: joi.boolean().required(),
    email: joi.string().trim().lowercase().min(3).email().required(),
    phone: joi.string().trim().required(),
    timezone: joi.string().min(1).required(),
    locale: joi.string().min(1).required(),
    password1: joi.string().min(8).required(),
    password2: joi.string().min(8).required(),
    acceptedTerms: joi.boolean().required()
  });

  // validate
  const { error, value } = schema.validate(req.args);
  if (error)
    return callback(null, errorResponse(req, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, joiErrorsMessage(error)));
  req.args = value; // updated arguments with type conversion

  // check passwords
  const msg = checkPasswords(req.args.password1, req.args.password2, 8);
  if (msg !== true)
    return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, req.__(msg)));
  req.args.password = req.args.password1; // set password

  // check terms of service
  if (!req.args.acceptedTerms)
    return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, req.__('You must agree to Terms of Service.')));

  try {
    // check if admin email already exists
    const duplicateAdmin = await models.admin.findOne({
      where: {
        email: req.args.email
      }
    });

    // check of duplicate admin user
    if (duplicateAdmin)
      return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, 1));

    // check timezone
    if (!isValidTimezone(req.args.timezone))
      return callback(null, errorResponse(req, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, req.__('Time zone is invalid.')));

    // create admin
    const newAdmin = await models.admin.create({
      timezone: req.args.timezone,
      locale: req.args.locale,
      name: req.args.name,
      active: req.args.active,
      email: req.args.email,
      phone: req.args.phone,
      password: req.args.password,
      acceptedTerms: req.args.acceptedTerms
    });

    // grab admin without sensitive data
    const returnAdmin = await models.admin.findByPk(newAdmin.id, {
      attributes: {
        exclude: models.admin.getSensitiveData() // remove sensitive data
      }
    }).catch(err => {
      newAdmin.destroy(); // destroy if error
      return callback(err);
    }); // END grab partner without sensitive data

    // SOCKET EMIT EVENT
    const data = { admin: returnAdmin };
    io.to(`${SOCKET_ROOMS.GLOBAL}`).emit(SOCKET_EVENTS.ADMIN_CREATED, data);
    io.to(`${SOCKET_ROOMS.ADMIN}${returnAdmin.id}`).emit(SOCKET_EVENTS.ADMIN_CREATED, data);

    // return
    return callback(null, {
      status: 201,
      success: true,
      admin: returnAdmin
    });
  } catch (err) {
    return callback(err);
  }
} // END V1Create
