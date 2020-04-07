/**
 * Test services/email
 *
 * !NOTE: These tests will only work if you go to services/email/sendgrid and uncomment "if (process.env.NODE_ENV === 'test') { return callback(); }"
 * !IMPORTANT only take out skip if you truely want to test EMAIL. We don't want to waste our emails
 */

'use strict';

// build-in node modules
const path = require('path');

// load test env
require('dotenv').config({ path: path.join(__dirname, '../../../config/.env.test') });

// grab test emails
const { TEST_EMAIL_1, TEST_EMAIL_2, TEST_EMAIL_3, TEST_EMAIL_4, TEST_EMAIL_5, TEST_EMAIL_6 } = process.env;

// assertion library
const { expect } = require('chai');

// services
const email = require('../../../services/email');

// !IMPORTANT to not send email, please go to config/.env.test and change DO_NOT_SEND_EMAIL_IN_TEST_MODE=true, if false, real email will be sent
describe('services/email', async () => {
  // send
  describe('send', async () => {
    it('should send mail successfully with only required arguments passed in (Promise).', async () => {
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test',
        tos: [TEST_EMAIL_1],
        ccs: null,
        bccs: null,
        args: null
      }

      // promise version
      try {
        const result = await email.send(params);
        expect(result).to.be.true;
      } catch (error) {
        expect(error).to.be.null;
      }
    }); // END should send mail successfully with only required arguments passed in.

    it('should send mail successfully with only required arguments passed in (Callback).', done => {
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test',
        tos: [TEST_EMAIL_1],
        ccs: null,
        bccs: null,
        args: null
      }

      // callback version
      email.send(params, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.true;
        done();
      });
    }); // END should send mail successfully with only required arguments passed in.

    it('should send mail successfully with all arguments passed in.', async () => {
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test', // test 2
        tos: [TEST_EMAIL_1],
        ccs: [TEST_EMAIL_6, TEST_EMAIL_2],
        bccs: [TEST_EMAIL_3, TEST_EMAIL_4],
        args: { argOne: 'ARGUMENT ONE', argTwo: 'ARGUMENT TWO' }
      }

      try {
        const result = await email.send(params);
        expect(result).to.be.true;
      } catch (error) {
        expect(error).to.be.null;
      }
    }); // END should send mail successfully with all arguments passed in.

    it('should send mail if ccs are duplicated with tos', async () => {
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test', // test 2
        tos: [TEST_EMAIL_1],
        ccs: [TEST_EMAIL_6, TEST_EMAIL_1],
        bccs: [TEST_EMAIL_3, TEST_EMAIL_4],
        args: { argOne: 'ARGUMENT ONE', argTwo: 'ARGUMENT TWO' }
      }

      try {
        const result = await email.send(params);
        expect(result).to.be.true;
      } catch (error) {
        expect(error).to.be.null;
      }
    }); // END should send mail if ccs are duplicated with tos

    it('should send mail if bccs are duplicated with ccs which are duplicated with tos', async () => {
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test', // test 2
        tos: [TEST_EMAIL_1],
        ccs: [TEST_EMAIL_6, TEST_EMAIL_1],
        bccs: [TEST_EMAIL_3, TEST_EMAIL_6],
        args: { argOne: 'ARGUMENT ONE', argTwo: 'ARGUMENT TWO' }
      }

      try {
        const result = await email.send(params);
        expect(result).to.be.true;
      } catch (error) {
        expect(error).to.be.null;
      }
    }); // END should send mail if bccs are duplicated with ccs which are duplicated with tos

    it('should fail to send mail if "from" or "name" is not specified.', async () => {
      // from is invalid
      const params1 = {
        from: null,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test', // test 1
        tos: [TEST_EMAIL_1],
        ccs: null,
        bccs: null,
        args: null
      }

      try {
        const result1 = await email.send(params1);
        expect(result1).to.be.null;
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Email must have a from, name, subject, and template in order to send.');
      }

      // name is invalid
      const params2 = {
        from: TEST_EMAIL_5,
        name: null,
        subject: 'TEST EMAIL',
        template: 'test', // test 1
        tos: [TEST_EMAIL_1],
        ccs: null,
        bccs: null,
        args: null
      }

      try {
        const result2 = await email.send(params2);
        expect(result2).to.be.null;
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Email must have a from, name, subject, and template in order to send.');
      }
    });

    it('should fail to send mail if "subject" is not specified.', async () => {
      // subject is invalid
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: null,
        template: 'test',
        tos: [TEST_EMAIL_1],
        ccs: null,
        bccs: null,
        args: null
      }

      try {
        const result = await email.send(params);
        expect(result).to.be.null;
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Email must have a from, name, subject, and template in order to send.');
      }
    }); // END should fail to send mail if "subject" is not specified.

    it('should fail to send mail if "template" is not specified.', async () => {
      // template is invalid
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: null,
        tos: [TEST_EMAIL_1],
        ccs: null,
        bccs: null,
        args: null
      }

      try {
        const result = await email.send(params);
        expect(result).to.be.null;
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Email must have a from, name, subject, and template in order to send.');
      }
    }); // END should fail to send mail if "template" is not specified.

    it('should fail to send mail if "tos" is not specified.', async () => {
      // tos is invalid
      const params = {
        from: TEST_EMAIL_5,
        name: 'John Doe',
        subject: 'TEST EMAIL',
        template: 'test',
        tos: [],
        ccs: null,
        bccs: null,
        args: null
      }

      try {
        const result = await email.send(params);
        expect(result).to.be.null;
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Email must be sent to at least one recipient.');
      }
    });
  }); // END send
}); // END services/email
