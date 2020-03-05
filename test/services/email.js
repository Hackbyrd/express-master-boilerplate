/**
 * Test services/email.js
 *
 * NOTE: These tests will only work if you go to services/email and uncomment "if (process.env.NODE_ENV === 'test') { return callback(); }"
 */

'use strict';

// build-in node modules
const path = require('path');

// load test env
require('dotenv').config({ path: path.join(__dirname, '../../config/.env.test') });

// grab test emails
const { TEST_EMAIL_1, TEST_EMAIL_2, TEST_EMAIL_3, TEST_EMAIL_4, TEST_EMAIL_5, TEST_EMAIL_6 } = process.env;

// assertion library
const { expect } = require('chai');

// helpers
const logic = require('../../helpers/logic');

// services
const email = require('../../services/email');

// !IMPORTANT only take out skip if you truely want to test EMAIL. We don't want to waste our emails
describe('services/email.js', () => {
  // mail
  describe('mail', () => {
    it('should send mail successfully with only required arguments passed in.', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: 'test',
          tos: [TEST_EMAIL_1],
          ccs: null,
          bccs: null,
          args: null
        },
        (err, result) => {
          expect(err).to.be.null;
          expect(result).to.be.true;
          done();
        }
      );
    });

    // !IMPORTANT only take out skip if you truely want to test EMAIL. We don't want to waste our emails
    it('should send mail successfully with all arguments passed in.', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: 'test', // test 2
          tos: [TEST_EMAIL_1],
          ccs: [TEST_EMAIL_6, TEST_EMAIL_2],
          bccs: [TEST_EMAIL_3, TEST_EMAIL_4],
          args: { argOne: 'ARGUMENT ONE', argTwo: 'ARGUMENT TWO' }
        },
        (err, result) => {
          expect(err).to.be.null;
          expect(result).to.be.true;
          done();
        }
      );
    });

    it('should send mail if ccs are duplicated with tos', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: 'test', // test 2
          tos: [TEST_EMAIL_1],
          ccs: [TEST_EMAIL_6, TEST_EMAIL_1],
          bccs: [TEST_EMAIL_3, TEST_EMAIL_4],
          args: { argOne: 'ARGUMENT ONE', argTwo: 'ARGUMENT TWO' }
        },
        (err, result) => {
          expect(err).to.be.null;
          expect(result).to.be.true;
          done();
        }
      );
    });

    it('should send mail if bccs are duplicated with ccs which are duplicated with tos', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: 'test', // test 2
          tos: [TEST_EMAIL_1],
          ccs: [TEST_EMAIL_6, TEST_EMAIL_1],
          bccs: [TEST_EMAIL_3, TEST_EMAIL_6],
          args: { argOne: 'ARGUMENT ONE', argTwo: 'ARGUMENT TWO' }
        },
        (err, result) => {
          expect(err).to.be.null;
          expect(result).to.be.true;
          done();
        }
      );
    });

    it('should fail to send mail if "from" or "name" is not specified.', done => {
      email.mail(
        {
          from: null,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: 'test', // test 1
          tos: [TEST_EMAIL_1],
          ccs: null,
          bccs: null,
          args: null
        },
        (err, result) => {
          expect(err).to.not.be.null;
          expect(err.message).to.equal('Email must have a from, name, subject, and template in order to send.');

          email.mail(
            {
              from: TEST_EMAIL_5,
              name: null,
              subject: 'TEST EMAIL',
              template: 'test', // test 1
              tos: [TEST_EMAIL_1],
              ccs: null,
              bccs: null,
              args: null
            },
            (err, result) => {
              expect(err).to.not.be.null;
              expect(err.message).to.equal('Email must have a from, name, subject, and template in order to send.');
              done();
            }
          );
        }
      );
    });

    it('should fail to send mail if "subject" is not specified.', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: null,
          template: 'test',
          tos: [TEST_EMAIL_1],
          ccs: null,
          bccs: null,
          args: null
        },
        (err, result) => {
          expect(err).to.not.be.null;
          expect(err.message).to.equal('Email must have a from, name, subject, and template in order to send.');
          done();
        }
      );
    });

    it('should fail to send mail if "template" is not specified.', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: null,
          tos: [TEST_EMAIL_1],
          ccs: null,
          bccs: null,
          args: null
        },
        (err, result) => {
          expect(err).to.not.be.null;
          expect(err.message).to.equal('Email must have a from, name, subject, and template in order to send.');
          done();
        }
      );
    });

    it('should fail to send mail if "tos" is not specified.', done => {
      email.mail(
        {
          from: TEST_EMAIL_5,
          name: 'John Doe',
          subject: 'TEST EMAIL',
          template: 'test',
          tos: [],
          ccs: null,
          bccs: null,
          args: null
        },
        (err, result) => {
          expect(err).to.not.be.null;
          expect(err.message).to.equal('Email must be sent to at least one recipient.');
          done();
        }
      );
    });
  }); // END mail
}); // END services/email
