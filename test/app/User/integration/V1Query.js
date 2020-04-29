/**
 * TEST USER V1Query METHOD
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

describe('User.V1Query', async () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/users';
  const routeMethod = '/query';
  const routeUrl = `${routeVersion}${routePrefix}${routeMethod}`;

  // clear database
  beforeEach(async () => {
    await reset();
  });

  // Logged Out
  describe('Role: Logged Out', async () => {
    // populate database with fixtures
    beforeEach(async () => {
      await populate('fix1');
    });

    it('[logged-out] should fail to query user', async () => {
      try {
        const res = await request(app).get(routeUrl);
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to query user
  }); // END Role: Logged Out

  // Admin
  describe('Role: Admin', async () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(async () => {
      await populate('fix1');
    });

    it('[admin] should query for users successfully', async () => {
      const admin1 = adminFix[0];

      try {
        // login admin
        const { token } = await adminLogin(app, routeVersion, request, admin1);

        const params = {
          company: 'Company',
          firstName: 'First 3',
          lastName: 'Last 3',
          active: true,
          email: 'user-3@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword1F%',
          acceptedTerms: true
        };

        // create user request
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/register`)
          .send(params);

        expect(res.statusCode).to.equal(201);

        const params2 = {
          active: true,
          sort: '-id',
          page: 1,
          limit: 10
        };

        // query user request
        const res2 = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params2);

        expect(res2.statusCode).to.equal(200);
        expect(res2.body).to.have.property('success', true);
        expect(res2.body).to.have.property('users');
        expect(res2.body.users.length).to.equal(3);
        expect(res2.body).to.have.property('page', 1);
        expect(res2.body).to.have.property('limit', 10);
        expect(res2.body).to.have.property('total', 3);
      } catch (error) {
        throw error;
      }
    }); // END [admin] should query for users successfully

    it('[admin] should query for users successfully but return 0 users', async () => {
      const admin1 = adminFix[0];

      try {
        // login admin
        const { token } = await adminLogin(app, routeVersion, request, admin1);

        const params = {
          active: false
        };

        // query user request
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params);

        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.have.property('users');
        expect(res.body.users.length).to.equal(0);
        expect(res.body).to.have.property('page', 1);
        expect(res.body).to.have.property('limit', 25);
        expect(res.body).to.have.property('total', 0);
      } catch (error) {
        throw error;
      }
    }); // END [admin] should query for users successfully but return 0 users
  }); // END Role: admin
}); // END User.V1Query
