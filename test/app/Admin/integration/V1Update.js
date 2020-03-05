/**
 * TEST ADMIN V1Update METHOD
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

describe('Admin.V1Update', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/update';
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

    it('[logged-out] should fail to update admin', done => {
      // update request
      request(app)
        .get(routeUrl)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
          done();
        }); // END read request
    }); // END [logged-out] should fail to update admin
  }); // END Role: Logged Out

  // Admin
  describe('Role: Admin', () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('[admin] should update self all fields successfully', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          timezone: 'Africa/Cairo',
          locale: 'ko',
          name: 'New name',
          phone: '+1240827485'
        }

        // update request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('admin');
            expect(res.body.admin).to.have.property('id', admin1.id);

            // find admin to see if he's updated
            models.admin.findByPk(admin1.id).then(foundAdmin => {
              expect(foundAdmin.timezone).to.equal(params.timezone);
              expect(foundAdmin.locale).to.equal(params.locale);
              expect(foundAdmin.phone).to.equal(params.phone);
              expect(foundAdmin.name).to.equal(params.name);
              done();
            }); // END find admin
          }); // END update request
      }); // END login admin
    }); // END [admin] should update self all fields successfully

    it('[admin] should fail to update self if timezone is invalid', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          timezone: 'randometimezone',
        }

        // update request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('Time zone is invalid.')));
            done();
          }); // END update request
      }); // END login admin
    }); // END [admin] should fail to update self if timezone is invalid
  }); // END Role: Admin
}); // END Admin.V1Update
