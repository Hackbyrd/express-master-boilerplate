/**
 * TEST ADMIN V1Login METHOD
 */

'use strict';

// build-in node modules
const path = require('path');

// load test env
require('dotenv').config({ path: path.join(__dirname, '../../../../config/.env.test') });

// ENV variables
const { NODE_ENV } = process.env;

// third party
const moment = require('moment-timezone');
const i18n = require('i18n');

// server & models
const app = require('../../../../server');
const models = require('../../../../models');

// assertion library
const { expect } = require('chai');
const request = require('supertest');

// services
const { errorResponse, ERROR_CODES } = require('../../../../services/error');

// helpers
const { adminLogin, userLogin, reset, populate } = require('../../../../helpers/tests');

describe('Admin - V1Login', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/login';
  const routeUrl = `${routeVersion}${routePrefix}${routeMethod}`;

  // clear database
  beforeEach(done => {
    reset(done);
  });

  // Logged Out
  describe('Role: Logged Out', () => {
    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('[logged-out] should login admin successfully', done => {
      const admin1 = adminFix[0];

      var loginParams = {
        email: admin1.email,
        password: admin1.password
      };

      // login admin
      request(app)
        .post(routeUrl)
        .send(loginParams)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body)
            .to.have.property('token')
            .and.to.a('string');
          expect(res.body).to.have.property('admin').and.to.not.be.null;

          // check if login count is updated and last login
          models.admin
            .findByPk(admin1.id)
            .then(foundAdmin => {
              expect(foundAdmin.loginCount).to.equal(1);
              expect(foundAdmin.lastLogin).to.not.be.null;
              done();
            })
            .catch(err => {
              throw err;
            });
        }); // END second request
    }); // END [logged-out] should login admin successfully

    it('[logged-out] should fail to login admin email or password is incorrect', done => {
      var loginParams = {
        email: 'random@email.com',
        password: '1029384756'
      };

      // login admin
      request(app)
        .post(routeUrl)
        .send(loginParams)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_CREDENTIALS));
          done();
        }); // END second request
    }); // END [logged-out] should fail to login admin email or password is incorrect

    it('[logged-out] should fail to login admin if account is not active', done => {
      const admin1 = adminFix[0];

      var loginParams = {
        email: admin1.email,
        password: admin1.password
      };

      // change to active false
      models.admin
        .update(
          {
            active: false
          },
          {
            where: {
              id: admin1.id
            }
          }
        )
        .then(() => {
          // login admin
          request(app)
            .post(routeUrl)
            .send(loginParams)
            .end((err, res) => {
              expect(res.statusCode).to.equal(400);
              expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_ACCOUNT_INACTIVE));
              done();
            }); // END second request
        });
    }); // END [logged-out] should fail to login admin if account is not active

    it('[logged-out] should fail to login admin if account is deleted', done => {
      const admin1 = adminFix[0];

      var loginParams = {
        email: admin1.email,
        password: admin1.password
      };

      // change to active false
      models.admin
        .update(
          {
            deletedAt: moment.tz('UTC')
          },
          {
            where: {
              id: admin1.id
            }
          }
        )
        .then(() => {
          // login admin
          request(app)
            .post(routeUrl)
            .send(loginParams)
            .end((err, res) => {
              expect(res.statusCode).to.equal(400);
              expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_ACCOUNT_DELETED));
              done();
            }); // END second request
        });
    }); // END [logged-out] should fail to login admin if account is deleted
  }); // END Role: Logged Out
}); // END Admin - V1Login
