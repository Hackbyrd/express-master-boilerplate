/**
 * TEST ADMIN V1UpdatePassword METHOD
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

describe('Admin - V1UpdatePassword', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/updatepassword';
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

    it('[logged-out] should fail to update password', done => {
      // read request
      request(app)
        .get(routeUrl)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
          done();
        }); // END read request
    }); // END [logged-out] should fail to update password
  }); // END Role: Logged Out

  // Admin
  describe('Role: Admin', () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('[admin] should update password successfully', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          password: admin1.password,
          password1: 'NEWPASSWORD',
          password2: 'NEWPASSWORD'
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

            // find admin to see if he's updated
            models.admin.findByPk(admin1.id).then(foundAdmin => {
              // check if password is new
              expect(foundAdmin.password).to.equal(bcrypt.hashSync(params.password1, foundAdmin.salt));
              done();
            }); // END find admin
          }); // END update request
      }); // END login admin
    }); // END [admin] should update password successfully

    it('[admin] should fail to update password if original password is incorrect', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          password: 'BADPASSWORD',
          password1: 'NEWPASSWORD',
          password2: 'NEWPASSWORD'
        };

        // update request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(
              errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('Original password is incorrect, please try again.'))
            );

            // find admin to see if password is same
            models.admin.findByPk(admin1.id).then(foundAdmin => {
              // check if password is new
              expect(foundAdmin.password).to.equal(bcrypt.hashSync(admin1.password, foundAdmin.salt));
              done();
            }); // END find admin
          }); // END update request
      }); // END login admin
    }); // END [admin] should fail to update password if original password is incorrect

    it('[admin] should fail to update password if password1 and password2 are not the same', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          password: admin1.password,
          password1: 'NEWPASSWORD1',
          password2: 'NEWPASSWORD2'
        };

        // update request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(
              errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('The passwords you entered do not match.'))
            );

            // find admin to see if password is same
            models.admin.findByPk(admin1.id).then(foundAdmin => {
              // check if password is new
              expect(foundAdmin.password).to.equal(bcrypt.hashSync(admin1.password, foundAdmin.salt));
              done();
            }); // END find admin
          }); // END update request
      }); // END login admin
    }); // END [admin] should fail to update password if password1 and password2 are not the same
  }); // END Role: Admin
}); // END Admin - V1UpdatePassword
