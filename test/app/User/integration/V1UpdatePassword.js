/**
 * TEST USER V1UpdatePassword METHOD
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

describe('User.V1UpdatePassword', async () => {
  // grab fixtures here
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/users';
  const routeMethod = '/updatepassword';
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

    it('[logged-out] should fail to update password', async () => {
      // update password request
      try {
        const res = await request(app).get(routeUrl);
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.UNAUTHORIZED));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to update password
  }); // END Role: Logged Out

  // User
  describe('Role: User', async () => {
    const jwt = 'jwt-user';

    // populate database with fixtures
    beforeEach(async () => {
      await populate('fix1');
    });

    it('[user] should update password successfully', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          password: user1.password,
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD1f%'
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
        // check if password is new
        expect(foundUser.password).to.equal(bcrypt.hashSync(params.password1, foundUser.salt));
      } catch (error) {
        throw error;
      }
    }); // END [user] should update password successfully

    it('[user] should fail to update password if password1 and password2 are not the same', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          password: user1.password,
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD2f%'
        };

        // call update email
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_PASSWORDS_NOT_EQUAL));

        // find user to see if the email is updated
        const foundUser = await models.user.findByPk(user1.id);
        expect(foundUser.password).to.equal(bcrypt.hashSync(user1.password, foundUser.salt));
      } catch (error) {
        throw error;
      }
    }); // END [user] should fail to update password if password1 and password2 are not the same

    it('[user] should fail to update password if original password is incorrect', async () => {
      const user1 = userFix[0];

      try {
        // login user
        const { token } = await userLogin(app, routeVersion, request, user1);

        const params = {
          password: 'BADPASSWORD',
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD1f%'
        };

        // call update email
        const res = await request(app)
          .post(routeUrl)
          .set('authorization', `${jwt} ${token}`)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_PASSWORD_AUTHENTICATION_FAILED));

        // find user to see if the email is updated
        const foundUser = await models.user.findByPk(user1.id);
        expect(foundUser.password).to.equal(bcrypt.hashSync(user1.password, foundUser.salt));
      } catch (error) {
        throw error;
      }
    }); // END [user] should fail to update password if original password is incorrect
  }); // END Role: User
}); // END User.V1UpdatePassword
