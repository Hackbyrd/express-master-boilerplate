/**
 * TEST ADMIN V1Query METHOD
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

describe('Admin - V1Query', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/query';
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

    it('[logged-out] should fail to query user', done => {
      const params = {
        id: 100000
      };

      // query request
      request(app)
        .post(routeUrl)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.deep.equal(errRes(i18n, 401, ERROR_CODES.UNAUTHORIZED));
          done();
        }); // END query request
    }); // END [logged-out] should fail to query user
  }); // END Role: Logged Out

  // Admin
  describe('Role: Admin', () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('[admin] should query for admins successfully', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
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

        // create third admin
        request(app)
          .post(`${routeVersion}${routePrefix}/create`)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(201);

            const params2 = {
              active: true,
              sort: '-id',
              page: 1,
              limit: 10
            };

            // query request
            request(app)
              .post(routeUrl)
              .set('authorization', `${jwt} ${token}`)
              .send(params2)
              .end((err, res) => {
                expect(err).to.be.null;
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('success', true);
                expect(res.body).to.have.property('admins');
                expect(res.body.admins.length).to.equal(3);
                expect(res.body).to.have.property('page', 1);
                expect(res.body).to.have.property('limit', 10);
                expect(res.body).to.have.property('total', 3);
                done();
              }); // END query request
          }); // END create third admin
      }); // END login admin
    }); // END [admin] should query for admins successfully

    it('[admin] should query for admins successfully but return 0 admins', done => {
      const admin1 = adminFix[0];

      // login admin
      adminLogin(app, routeVersion, request, admin1, (err, res, token) => {
        const params = {
          active: false
        };

        // query request
        request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('admins');
            expect(res.body.admins.length).to.equal(0);
            expect(res.body).to.have.property('page', 1);
            expect(res.body).to.have.property('limit', 25);
            expect(res.body).to.have.property('total', 0);
            done();
          }); // END query request
      }); // END login admin
    }); // END [admin] should query for admins successfully but return 0 admins
  }); // END Role: Admin
}); // END Admin - V1Query
