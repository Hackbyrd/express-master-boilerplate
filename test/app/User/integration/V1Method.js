/**
 * TEST USER V1Method METHOD
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

describe('User.V1Method', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/MAKE USER PLURAL';
  const routeMethod = '/method';
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

    it('should test something', done => {
      done();
    }); // END should test something
  }); // END Role: Logged Out

  // Role: Admin
  describe('Role: Admin', () => {
    const jwt = 'jwt-admin';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('should test something', done => {
      done();
    }); // END should test something
  }); // END Role: Admin

  // Role: User
  describe('Role: User', () => {
    const jwt = 'jwt-user';

    // populate database with fixtures
    beforeEach(done => {
      populate('fix1', done);
    });

    it('should test something', done => {
      done();
    }); // END should test something
  }); // END Role: User
}); // END User.V1Method
