/**
 * TEST ADMIN V1ConfirmPassword METHOD
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

describe('Admin - V1ConfirmPassword', () => {
  // grab fixtures here
  const adminFix = require('../../../fixtures/fix1/admin');
  const userFix = require('../../../fixtures/fix1/user');

  // url of the api method we are testing
  const routeVersion = '/v1';
  const routePrefix = '/admins';
  const routeMethod = '/confirmpassword';
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

    it('[logged-out] should confirm password successfully', done => {
      const admin1 = adminFix[0];

      let params = {
        email: admin1.email,
        password1: 'NEWPASSWORD',
        password2: 'NEWPASSWORD'
      };

      // call reset password
      request(app)
        .post(`${routeVersion}${routePrefix}/resetpassword`)
        .send(params)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);

          // grab token
          models.admin
            .findByPk(admin1.id)
            .then(foundAdmin => {
              const params = {
                passwordResetToken: foundAdmin.passwordResetToken
              };

              // confirm password
              request(app)
                .post(routeUrl)
                .send(params)
                .end((err, res) => {
                  expect(res.statusCode).to.equal(200);
                  expect(res.body).to.have.property('success', true);

                  // grab admin again
                  models.admin
                    .findByPk(admin1.id)
                    .then(updatedAdmin => {
                      expect(updatedAdmin.password).to.equal(foundAdmin.resetPassword);
                      expect(updatedAdmin.resetPassword).to.be.null;
                      expect(updatedAdmin.passwordResetToken).to.be.null;
                      done();
                    })
                    .catch(err => {
                      throw err;
                    });
                }); // END call confirm password
            })
            .catch(err => {
              throw err;
            });
        }); // END call reset password
    }); // END [logged-out] should confirm password successfully

    it('[logged-out] should fail to confirm password if token is invalid', done => {
      const admin1 = adminFix[0];

      let params = {
        email: admin1.email,
        password1: 'NEWPASSWORD',
        password2: 'NEWPASSWORD'
      };

      // call reset password
      request(app)
        .post(`${routeVersion}${routePrefix}/resetpassword`)
        .send(params)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);

          // grab token
          models.admin
            .findByPk(admin1.id)
            .then(foundAdmin => {
              const params = {
                passwordResetToken: 'gibberish'
              };

              // confirm password
              request(app)
                .post(routeUrl)
                .send(params)
                .end((err, res) => {
                  expect(res.statusCode).to.equal(400);
                  expect(res.body).to.deep.equal(
                    errorResponse(i18n, ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS, i18n.__('Invalid password reset token or reset token has expired.'))
                  );
                  done();
                }); // END call confirm password
            })
            .catch(err => {
              throw err;
            });
        }); // END call reset password
    }); // END [logged-out] should fail to confirm password if token is invalid

    it('[logged-out] should fail to confirm password if token has expired', done => {
      const admin1 = adminFix[0];

      let params = {
        email: admin1.email,
        password1: 'NEWPASSWORD',
        password2: 'NEWPASSWORD'
      };

      // call reset password
      request(app)
        .post(`${routeVersion}${routePrefix}/resetpassword`)
        .send(params)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);

          // update expire
          models.admin
            .update(
              {
                passwordResetExpire: moment.tz('UTC').subtract('5', 'days')
              },
              {
                where: {
                  email: params.email
                }
              }
            )
            .then(() => {
              // grab token
              models.admin
                .findByPk(admin1.id)
                .then(foundAdmin => {
                  const params = {
                    passwordResetToken: foundAdmin.passwordResetToken
                  };

                  // confirm password
                  request(app)
                    .post(routeUrl)
                    .send(params)
                    .end((err, res) => {
                      expect(res.statusCode).to.equal(400);
                      expect(res.body).to.deep.equal(
                        errorResponse(
                          i18n,
                          ERROR_CODES.ADMIN_BAD_REQUEST_INVALID_ARGUMENTS,
                          i18n.__('Invalid password reset token or reset token has expired.')
                        )
                      );
                      done();
                    }); // END call confirm password
                })
                .catch(err => {
                  throw err;
                }); // grab admin
            })
            .catch(err => {
              throw err;
            }); // update admin
        }); // END call reset password
    }); // END [logged-out] should fail to confirm password if token is invalid
  }); // END Role: Logged Out
}); // END Admin - V1ConfirmPassword
