/**
 * TEST ADMIN V1UpdateEmail METHOD
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
const bcrypt = require('bcrypt');
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

describe('Admin.V1UpdateEmail', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/updateemail';
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

    it('[logged-out] should fail to update email', done => {
      // update request
      request(app)
        .get(routeUrl)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
          done();
        }); // END update request
    }); // END [logged-out] should fail to update email
  }); // END Role: Logged Out

  // Admin
  describe('Role: Admin', () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('[admin] should update email successfully', done => {
      const admin1 = adminFix[0];
      const newEmail = 'test@example.com';

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          newEmail: newEmail
        };

        // update request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('success', true);

            // find admin to see if the email is updated
            models.admin.findByPk(admin1.id).then(foundAdmin => {
              expect(foundAdmin.email).to.equal(params.newEmail);
              done();
            }); // END find admin
          }); // END update request
      }); // END login admin
    }); // END [admin] should update email successfully

    it('[admin] should fail to update if new email is the same as the current email', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          newEmail: admin1.email
        };

        // call update email
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(
              errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('New email cannot be the same as the current email.'))
            );
            done();
          }); // END call update email
      }); // END login admin
    }); // END [admin] should fail to update if new email is the same as the current email

    it('[admin] should not update email if the new email is already being used', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        let params = {
          name: 'Admin 3',
          active: true,
          email: 'admin-3@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword',
          password2: 'thisisapassword',
          acceptedTerms: true
        };

        // create second admin
        request(app)
          .post(`${routeVersion}${routePrefix}/create`)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(201);

            params = {
              newEmail: 'admin-3@example.com'
            };

            // call update email
            request(app)
              .post(routeUrl)
              .set('authorization', `${jwt} ${token}`)
              .send(params)
              .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.deep.equal(
                  errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('The new email is already being used.'))
                );
                done();
              }); // END call update email
          }); // END create second admin
      }); // END login admin
    }); // END [admin] should not update email if the new email is already being used
  }); // END Role: Admin
}); // END Admin.V1UpdateEmail
