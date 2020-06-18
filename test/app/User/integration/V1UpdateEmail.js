/**
 * TEST USER V1UpdateEmail METHOD
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
const { userLogin, reset, populate } = require('../../../../helpers/tests');

describe('User.V1UpdateEmail', async () => {
  // grab fixtures here
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/users';
  const routeMethod = '/updateemail';
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

    it('[logged-out] should fail to update email', async () => {
      // update request
      try {
        const res = await request(app).get(routeUrl);
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to update email
  }); // END Role: Logged Out

  // User
  describe('Role: User', async () => {
    const jwt = 'jwt-user';

    // populate database with fixtures
    beforeEach(async () => {
      await populate('fix1');
    });

    it('[user] should update email successfully', async () => {
      const user1 = userFix[0];
      const email = 'test@example.com';

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          email: email
        };

        // read user request
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params)

        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success', true);

        // find user to see if the email is updated
        const foundUser = await models.user.findByPk(user1.id);
        expect(foundUser.email).to.equal(params.email);
      } catch (error) {
        throw error;
      }
    }); // END [user] should update email successfully

    it('[user] should fail to update if new email is the same as the current email', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          email: user1.email
        };

        // call update email
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_SAME_EMAIL));
      } catch (error) {
        throw error;
      }
    }); // END [user] should fail to update if new email is the same as the current email

    it('[user] should not update email if the new email is already being used', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          company: 'New company',
          firstName: 'First User 3',
          lastName: 'Last User 3',
          active: true,
          email: 'user-3@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword1F%',
          acceptedTerms: true
        };

        // register new user request
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/register`)
          .send(params);
        expect(res.statusCode).to.equal(201);

        const params2 = {
          email: 'user-3@example.com'
        };

        // update email request
        const res2 = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params2);

        expect(res2.statusCode).to.equal(400);
        expect(res2.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_EMAIL_ALREADY_TAKEN));
      } catch (error) {
        throw error;
      }
    }); // END [user] should not update email if the new email is already being used
  }); // END Role: User
}); // END User.V1UpdateEmail
