/**
 * ADMIN V1Login SERVICE
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
const { listIntRegex } = require('../../../helpers/constants');

// methods
module.exports = {
  V1Login
};

/**
 * Login an admin
 *
 * GET  /v1/admins/login
 * POST /v1/admins/login
 *
 * Must be logged out
 * Roles: []
 *
 * req.params = {}
 * req.args = {
 *   email - (STRING - REQUIRED): The email of the admin,
 *   password - (STRING - REQUIRED): The unhashed password of the admin
 * }
 *
 * Success: Return an admin and JWT token.
 * Errors:
 *   400: BAD_REQUEST_LOGIN_FAILED
 *   400: BAD_REQUEST_ACCOUNT_INACTIVE
 *   400: BAD_REQUEST_ACCOUNT_DELETED
 *   500: INTERNAL_SERVER_ERROR
 */
function V1Login(req, res, callback) {
  // login admin WITHOUT SESSION
  passport.authenticate('JWTAdminLogin', { session: false }, (err, admin, info) => {
    if (err) return callback(err);

    // check if admin exists
    if (!admin) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_INVALID_CREDENTIALS));

    // return error message if admin is inactive
    if (!admin.active) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_ACCOUNT_INACTIVE));

    // return error message if admin is deleted
    if (admin.deletedAt) return callback(null, errRes(req, 400, ERROR_CODES.BAD_REQUEST_ACCOUNT_DELETED));

    // update login count and last login
    models.admin
      .update(
        {
          loginCount: admin.loginCount + 1,
          lastLogin: moment.tz('UTC')
        },
        {
          where: {
            id: admin.id
          }
        }
      )
      .then(() => {
        // find admin
        return models.admin.findByPk(admin.id, {
          attributes: {
            exclude: models.admin.getSensitiveData() // remove sensitive data
          }
        });
      })
      .then(getAdmin => {
        return callback(null, {
          status: 201,
          success: true,
          token: createJwtToken(getAdmin, ADMIN_CLIENT_HOST),
          admin: getAdmin.dataValues
        });
      })
      .catch(err => callback(err));
  })(req, res, null);
} // END V1Login
