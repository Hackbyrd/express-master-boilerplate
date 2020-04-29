/**
 * TEST USER V1Update METHOD
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
const { userLogin, reset, populate } = require('../../../../helpers/tests');

describe('User.V1Update', async () => {
  // grab fixtures here
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/users';
  const routeMethod = '/update';
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

    it('[logged-out] should fail to update user', async () => {
      // update request
      try {
        const res = await request(app).get(routeUrl);
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to update user
  }); // END Role: Logged Out

  // User
  describe('Role: User', async () => {
    const jwt = 'jwt-user';

    // populate database with fixtures
    beforeEach(async () => {
      await populate('fix1');
    });

    it('[user] should update self all fields successfully', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          timezone: 'Africa/Cairo',
          locale: 'ko',
          company: 'New Company',
          firstName: 'New first name',
          lastName: 'New last name',
          phone: '+1240827485'
        }

        // update user request
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params);

        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.have.property('user');
        expect(res.body.user).to.have.property('id', user1.id);

        // find user to see if he's updated
        const foundUser = await models.user.findByPk(user1.id);
        expect(foundUser.timezone).to.equal(params.timezone);
        expect(foundUser.locale).to.equal(params.locale);
        expect(foundUser.phone).to.equal(params.phone);
        expect(foundUser.company).to.equal(params.company);
        expect(foundUser.firstName).to.equal(params.firstName);
        expect(foundUser.lastName).to.equal(params.lastName);
      } catch (error) {
        throw error;
      }
    }); // END [user] should update self all fields successfully

    it('[user] should fail to update self if timezone is invalid', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          timezone: 'randometimezone',
        };

        // read user request
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_INVALID_TIMEZONE));
      } catch (error) {
        throw error;
      }
    }); // END [user] should fail to update self if timezone is invalid
  }); // END Role: User
}); // END User.V1Update
