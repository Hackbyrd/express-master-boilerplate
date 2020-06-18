/**
 * TEST USER V1ConfirmPassword METHOD
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
const bcrypt = require('bcrypt');

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

describe('User.V1ConfirmPassword', async () => {
  // grab fixtures here
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/users';
  const routeMethod = '/confirmpassword';
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

    it('[logged-out] should confirm password successfully', async () => {
      const user1 = userFix[0];

      const params = {
        email: user1.email
      };

      try {
        // call reset password
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/resetpassword`)
          .send(params);

        expect(res.statusCode).to.equal(200);

        // grab token
        const foundUser = await models.user.findByPk(user1.id);
        const params2 = {
          passwordResetToken: foundUser.passwordResetToken,
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD1f%'
        };

        // confirm password
        const res2 = await request(app)
          .post(routeUrl)
          .send(params2);

        expect(res2.statusCode).to.equal(200);
        expect(res2.body).to.have.property('success', true);

        // get updated user
        const updatedUser = await models.user.findByPk(user1.id);
        const resetPassword = bcrypt.hashSync(params2.password1, updatedUser.salt);

        expect(updatedUser.password).to.equal(resetPassword);
        expect(updatedUser.passwordResetToken).to.be.null;
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should confirm password successfully

    it('[logged-out] should fail to confirm password if token is invalid', async () => {
      const user1 = userFix[0];

      const params = {
        email: user1.email
      };

      try {
        // call reset password
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/resetpassword`)
          .send(params);

        expect(res.statusCode).to.equal(200);

        // grab token
        const params2 = {
          passwordResetToken: 'gibberish',
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD1f%'
        };

        // confirm password
        const res2 = await request(app)
          .post(routeUrl)
          .send(params2);

        expect(res2.statusCode).to.equal(400);
        expect(res2.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_INVALID_PASSWORD_RESET_TOKEN));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to confirm password if token is invalid

    it('[logged-out] should fail to confirm password if token has expired', async () => {
      const user1 = userFix[0];

      const params = {
        email: user1.email
      };

      try {
        // call reset password
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/resetpassword`)
          .send(params);

        expect(res.statusCode).to.equal(200);

        // grab token
        const foundUser = await models.user.findByPk(user1.id);
        const params2 = {
          passwordResetToken: foundUser.passwordResetToken,
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD1f%'
        };

        // update expiration of password reset token
        await models.user.update({
          passwordResetExpire: moment.tz('UTC').subtract('5', 'days')
        }, {
          where: {
            email: params.email
          }
        });

        // confirm password
        const res2 = await request(app)
          .post(routeUrl)
          .send(params2);

        expect(res2.statusCode).to.equal(400);
        expect(res2.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_INVALID_PASSWORD_RESET_TOKEN));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to confirm password if token is invalid

    it('[logged-out] should fail to call confirm password if password1 and password2 are not the same', async () => {
      const user1 = userFix[0];

      const params = {
        email: user1.email
      };

      try {
        // call reset password
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/resetpassword`)
          .send(params);

        expect(res.statusCode).to.equal(200);

        // grab token
        const foundUser = await models.user.findByPk(user1.id);
        const params2 = {
          passwordResetToken: foundUser.passwordResetToken,
          password1: 'NEWPASSWORD1f%',
          password2: 'NEWPASSWORD2f%'
        };

        // confirm password
        const res2 = await request(app)
          .post(routeUrl)
          .send(params2);

        expect(res2.statusCode).to.equal(400);
        expect(res2.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.USER_BAD_REQUEST_PASSWORDS_NOT_EQUAL));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to call confirm password because email does not exist

    it('[logged-out] should fail to call confirm password if password1 and password2 have an invalid password format', async () => {
      const user1 = userFix[0];

      const params = {
        email: user1.email
      };

      try {
        // call reset password
        const res = await request(app)
          .post(`${routeVersion}${routePrefix}/resetpassword`)
          .send(params);

        expect(res.statusCode).to.equal(200);

        // grab token
        const foundUser = await models.user.findByPk(user1.id);
        const params2 = {
          passwordResetToken: foundUser.passwordResetToken,
          password1: 'NEWPASSWORD',
          password2: 'NEWPASSWORD'
        };

        // confirm password
        const res2 = await request(app)
          .post(routeUrl)
          .send(params2);

        expect(res2.statusCode).to.equal(400);
        expect(res2.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('USER[Invalid Password Format]')));
      } catch (error) {
        throw error;
      }
    }); // END [logged-out] should fail to call confirm password if password1 and password2 have an invalid password format
  }); // END Role: Logged Out
}); // END User.V1ConfirmPassword
