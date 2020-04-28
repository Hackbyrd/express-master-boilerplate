/**
 * TEST ADMIN V1ResetPassword METHOD
 */

'use strict';

// build-in node modules
const path = require('path');

// load test env
require('dotenv').config({ path: path.join(__dirname, '../../../../config/.env.test') });

// ENV variables
const { NODE_ENV, ADMIN_CLIENT_HOST } = process.env;

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

describe('Admin.V1ResetPassword', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/resetpassword';
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

    it('[logged-out] should call reset password successfully', done => {
      const admin1 = adminFix[0];

      let params = {
        email: admin1.email,
        password1: 'NEWPASSWORD',
        password2: 'NEWPASSWORD'
      };

      request(app)
        .post(routeUrl)
        .send(params)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property(
            'message',
            'An email has been sent to ' + params.email + '. Please check your email to confirm your new password change.'
          );

          // check if resetPassword, passwordResetToken, passwordResetExpire are there
          models.admin
            .findByPk(admin1.id)
            .then(foundAdmin => {
              expect(foundAdmin.resetPassword).to.equal(bcrypt.hashSync(params.password1, foundAdmin.salt));
              expect(foundAdmin.passwordResetToken)
                .to.be.a('string')
                .with.lengthOf.at.least(64);
              expect(foundAdmin.passwordResetExpire).to.not.be.null;

              // check reset link
              expect(res.body).to.have.property('resetLink', `${ADMIN_CLIENT_HOST}/confirm-password?passwordResetToken=${foundAdmin.passwordResetToken}`);
              done();
            })
            .catch(err => {
              throw err;
            });
        });
    }); // END [logged-out] should call reset password successfully

    it('[logged-out] should fail to call reset password because email does not exist', done => {
      const admin1 = adminFix[0];

      let params = {
        email: 'noemail@email.com',
        password1: 'NEWPASSWORD',
        password2: 'NEWPASSWORD'
      };

      request(app)
        .post(routeUrl)
        .send(params)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.deep.equal(errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST));
          done();
        });
    }); // END [logged-out] should fail to call reset password because email does not exist

    it('[logged-out] should fail to call reset password if password1 and password2 are not the same', done => {
      const admin1 = adminFix[0];

      let params = {
        email: admin1.email,
        password1: 'NEWPASSWORD1',
        password2: 'NEWPASSWORD2'
      };

      request(app)
        .post(routeUrl)
        .send(params)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.deep.equal(
            errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('The passwords you entered do not match.'))
          );
          done();
        });
    }); // END [logged-out] should fail to call reset password because email does not exist
  }); // END Role: Logged Out
}); // END Admin.V1ResetPassword
