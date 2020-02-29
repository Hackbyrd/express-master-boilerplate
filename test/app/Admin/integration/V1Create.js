/**
 * TEST ADMIN V1Create METHOD
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

describe('Admin - V1Create', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/create';
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

    it('[logged-out] should fail to create admin', done => {
      // create request
      request(app)
        .get(routeUrl)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
          done();
        }); // END read request
    }); // END [logged-out] should fail to create admin
  }); // END Role: Logged Out

  // Admin
  describe('Role: Admin', () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('[admin] should create an admin successfully', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        var params = {
          name: 'Jonathan Chen',
          active: true,
          email: 'new-admin@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword',
          password2: 'thisisapassword',
          acceptedTerms: true
        };

        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(201);
            expect(res.body.admin.id).to.equal(adminFix.length + 1);
            expect(res.body.admin.timezone).to.equal(params.timezone);
            expect(res.body.admin.locale).to.equal(params.locale);
            expect(res.body.admin.active).to.be.true;
            expect(res.body.admin.name).to.equal(params.name);
            expect(res.body.admin.email).to.equal(params.email);
            expect(res.body.admin.phone).to.equal(params.phone);
            expect(res.body.admin.passwordResetExpire).to.be.a('string');
            expect(res.body.admin.acceptedTerms).to.be.true;
            expect(res.body.admin.loginCount).to.equal(0);
            expect(res.body.admin.lastLogin).to.be.null;
            expect(res.body.admin.createdAt).to.be.a('string');
            expect(res.body.admin.updatedAt).to.be.a('string');

            // check if admin was created
            models.admin
              .findByPk(res.body.admin.id)
              .then(foundAdmin => {
                expect(foundAdmin.name).to.equal(params.name);
                expect(foundAdmin.timezone).to.equal(params.timezone);
                expect(foundAdmin.locale).to.equal(params.locale);
                expect(foundAdmin.active).to.be.true;
                expect(foundAdmin.name).to.equal(params.name);
                expect(foundAdmin.email).to.equal(params.email);
                expect(foundAdmin.phone).to.equal(params.phone);
                expect(foundAdmin.passwordResetExpire).to.not.be.null;
                expect(foundAdmin.acceptedTerms).to.be.true;
                expect(foundAdmin.loginCount).to.equal(0);
                expect(foundAdmin.lastLogin).to.be.null;
                expect(foundAdmin.createdAt).to.not.be.null;
                expect(foundAdmin.updatedAt).to.not.be.null;

                done();
              })
              .catch(err => {
                throw err;
              }); // END check admin
          });
      }); // END login admin
    }); // END [admin] should create an admin successfully

    it('[admin] should not create new admin if passwords are not the same', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        var params = {
          name: 'Jonathan Chen',
          active: true,
          email: 'new-admin@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1',
          password2: 'thisisapassword2',
          acceptedTerms: true
        };

        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(
              errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('The passwords you entered do not match.'))
            );
            done();
          });
      }); // END login admin
    }); // END [admin] should not create new admin if passwords are not the same

    it('[admin] should not create new admin if acceptedTerms is false', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        var params = {
          name: 'Jonathan Chen',
          active: true,
          email: 'new-admin@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword',
          password2: 'thisisapassword',
          acceptedTerms: false
        };

        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(
              errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('You must agree to Terms of Service.'))
            );
            done();
          });
      }); // END login admin
    }); // END [admin] should not create new admin if acceptedTerms is false

    it('[admin] should not create new admin if email already exists', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        var params = {
          name: 'Jonathan Chen',
          active: true,
          email: admin1.email,
          phone: '+12406206949',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword',
          password2: 'thisisapassword',
          acceptedTerms: true
        };

        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, 1));
            done();
          });
      }); // END login admin
    }); // END [admin] should not create new admin if email already exists

    it('[admin] should not create new admin if timezone is invalid', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        var params = {
          name: 'Jonathan Chen',
          active: true,
          email: 'new-partner-email@email.com',
          phone: '+12406206949',
          timezone: 'randomtimezone',
          locale: 'en',
          password1: 'thisisapassword',
          password2: 'thisisapassword',
          acceptedTerms: true
        };

        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('Time zone is invalid.')));
            done();
          });
      }); // END login admin
    }); // END [admin] should not create new admin if timezone is invalid
  }); // END Role: Admin
}); // END ADMIN
