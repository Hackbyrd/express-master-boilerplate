/**
 * TEST USER V1Register METHOD
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
const { reset, populate } = require('../../../../helpers/tests');

describe('User.V1Register', async () => {
  // grab fixtures here
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/users';
  const routeMethod = '/register';
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

    it('[Logged Out] should register a user successfully', async () => {
      try {
        const params = {
          company: 'New Company',
          lastName: 'Jonathan',
          firstName: 'Chen',
          active: true,
          email: 'new-user@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword1F%',
          acceptedTerms: true
        };

        // register user request
        const res = await request(app)
          .post(routeUrl)
          .send(params);

        expect(res.statusCode).to.equal(201);
        expect(res.body.user.id).to.equal(userFix.length + 1);
        expect(res.body.user.timezone).to.equal(params.timezone);
        expect(res.body.user.locale).to.equal(params.locale);
        expect(res.body.user.active).to.be.true;
        expect(res.body.user.company).to.equal(params.company);
        expect(res.body.user.firstName).to.equal(params.firstName);
        expect(res.body.user.lastName).to.equal(params.lastName);
        expect(res.body.user.email).to.equal(params.email);
        expect(res.body.user.phone).to.equal(params.phone);
        expect(res.body.user.passwordResetExpire).to.be.a('string');
        expect(res.body.user.acceptedTerms).to.be.true;
        expect(res.body.user.loginCount).to.equal(0);
        expect(res.body.user.lastLogin).to.be.null;
        expect(res.body.user.createdAt).to.be.a('string');
        expect(res.body.user.updatedAt).to.be.a('string');

        // check if user was created
        const checkUser = await models.user.findByPk(res.body.user.id);
        expect(checkUser.name).to.equal(params.name);
        expect(checkUser.timezone).to.equal(params.timezone);
        expect(checkUser.locale).to.equal(params.locale);
        expect(checkUser.active).to.be.true;
        expect(checkUser.company).to.equal(params.company);
        expect(checkUser.firstName).to.equal(params.firstName);
        expect(checkUser.lastName).to.equal(params.lastName);
        expect(checkUser.email).to.equal(params.email);
        expect(checkUser.phone).to.equal(params.phone);
        expect(checkUser.passwordResetExpire).to.not.be.null;
        expect(checkUser.acceptedTerms).to.be.true;
        expect(checkUser.loginCount).to.equal(0);
        expect(checkUser.lastLogin).to.be.null;
        expect(checkUser.createdAt).to.not.be.null;
        expect(checkUser.updatedAt).to.not.be.null;
      } catch (error) {
        throw error;
      }
    }); // END [Logged Out] should register a user successfully

    it('[Logged Out] should not register new user if passwords format is invalid', async () => {
      try {

        const params = {
          company: 'New Company',
          lastName: 'Jonathan',
          firstName: 'Chen',
          active: true,
          email: 'new-user@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword',
          password2: 'thisisapassword',
          acceptedTerms: true
        };

        // register user request
        const res = await request(app)
          .post(routeUrl)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('USER[Invalid Password Format]')));
      } catch (error) {
        throw error;
      }
    }); // END [Logged Out] should not register new user if passwords format is invalid

    it('[Logged Out] should not register new user if passwords are not the same', async () => {
      try {
        const params = {
          company: 'New Company',
          lastName: 'Jonathan',
          firstName: 'Chen',
          active: true,
          email: 'new-user@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword2F%',
          acceptedTerms: true
        };

        // register user request
        const res = await request(app)
          .post(routeUrl)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_PASSWORDS_NOT_EQUAL));
      } catch (error) {
        throw error;
      }
    }); // END [Logged Out] should not register new user if passwords are not the same

    it('[Logged Out] should not register new user if acceptedTerms is false', async () => {
      try {
        const params = {
          company: 'New Company',
          lastName: 'Jonathan',
          firstName: 'Chen',
          active: true,
          email: 'new-user@example.com',
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword1F%',
          acceptedTerms: false
        };

        // register user request
        const res = await request(app)
          .post(routeUrl)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_TERMS_OF_SERVICE_NOT_ACCEPTED));
      } catch (error) {
        throw error;
      }
    }); // END [Logged Out] should not register new user if acceptedTerms is false

    it('[Logged Out] should not register new user if email already exists', async () => {
      const user1 = userFix[0];

      try {
        const params = {
          company: 'New Company',
          lastName: 'Jonathan',
          firstName: 'Chen',
          active: true,
          email: user1.email,
          phone: '+12406206950',
          timezone: 'America/Los_Angeles',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword1F%',
          acceptedTerms: true
        };

        // register user request
        const res = await request(app)
          .post(routeUrl)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_USER_ALREADY_EXISTS));
      } catch (error) {
        throw error;
      }
    }); // END [Logged Out] should not register new user if email already exists

    it('[Logged Out] should not register new user if timezone is invalid', async () => {
      try {
        const params = {
          company: 'New Company',
          lastName: 'Jonathan',
          firstName: 'Chen',
          active: true,
          email: 'new-user@example.com',
          phone: '+12406206950',
          timezone: 'invalid-timezone',
          locale: 'en',
          password1: 'thisisapassword1F%',
          password2: 'thisisapassword1F%',
          acceptedTerms: true
        };

        // register user request
        const res = await request(app)
          .post(routeUrl)
          .send(params);

        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_INVALID_TIMEZONE));
      } catch (error) {
        throw error;
      }
    }); // END [Logged Out] should not register new user if timezone is invalid
  }); // END Role: Logged Out
}); // END User.V1Register
