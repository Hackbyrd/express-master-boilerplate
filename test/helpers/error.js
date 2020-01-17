/**
 * Test error.js Helper
 */

'use strict';

// build-in node modules
const path = require('path');

// third-party
const i18n = require('i18n');

// load test env
require('dotenv').config({ path: path.join(__dirname, '../../config/.env.test') });

// assertion library
const { expect } = require('chai');

// helper
const { errRes, joiErrors, ERROR_CODES } = require('../../helpers/error');

describe('helpers/error.js', () => {
  describe('errRes', function() {
    it('should create the error response JSON correctly', done => {
      const resultJSON = errRes(i18n, 400, ERROR_CODES.UNAUTHORIZED, 0);
      expect(resultJSON.status).to.equal(400);
      expect(resultJSON.success).to.be.false;
      expect(resultJSON.error).to.equal(ERROR_CODES.UNAUTHORIZED.code);
      expect(resultJSON.message).to.equal(ERROR_CODES.UNAUTHORIZED.messages[0]);
      done();
    }); // END should create the error response JSON correctly

    it('should create the error response JSON with custom message correctly', done => {
      const resultJSON = errRes(i18n, 400, ERROR_CODES.UNAUTHORIZED, 0, 'TEST MESSAGE');
      expect(resultJSON.status).to.equal(400);
      expect(resultJSON.success).to.be.false;
      expect(resultJSON.error).to.equal(ERROR_CODES.UNAUTHORIZED.code);
      expect(resultJSON.message).to.equal('TEST MESSAGE');
      done();
    }); // END should create the error response JSON with custom message correctly
  }); // END errRes
}); // END helpers/error.js
