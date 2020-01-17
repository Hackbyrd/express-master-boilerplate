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

// helpers
const { adminLogin, userLogin, reset, populate } = require('../../../../helpers/tests');
const { errRes, ERROR_CODES } = require('../../../../helpers/error');

describe('Admin - V1Update', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/read';
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
          expect(res.body).to.deep.equal(errRes(i18n, 401, ERROR_CODES.UNAUTHORIZED));
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
    // TODO: start here
    it('[admin] should read self successfully', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        // read request
        request(app)
          .get(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('admin');
            expect(res.body.admin).to.have.property('id', admin1.id);
            done();
          }); // END read request
      }); // END login admin
    }); // END [admin] should read self successfully

    it('[admin] should read another admin successfully', done => {
      const admin1 = adminFix[0];
      const admin2 = adminFix[1];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        // params
        const params = {
          id: admin2.id
        };

        // read request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('admin');
            expect(res.body.admin).to.have.property('id', admin2.id);
            done();
          }); // END read request
      }); // END login admin
    }); // END [admin] should read another admin successfully

    it('[admin] should fail to read admin if admin does not exist', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        // params
        const params = {
          id: 10000
        };

        // read request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.deep.equal(errRes(i18n, 400, ERROR_CODES.BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST));
            done();
          }); // END read request
      }); // END login admin
    }); // END [admin] should fail to read admin if admin does not exist
  }); // END Role: Admin
}); // END Admin - V1Update
