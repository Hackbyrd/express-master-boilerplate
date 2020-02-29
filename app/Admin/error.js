/**
 * Admin Error Service:
 *
 * For Better Client 4xx Error Handling For Admin Feature
 * Gets exported to /services/error.js and put in variable ERROR_CODES
 */

'use strict';

/**
 * Admin Local Error Codes
 */
const LOCAL_ERROR_CODES = {
  /* Place error codes below. Remember to prepend ADMIN to the key and error value  */
  ADMIN_BAD_REQUEST_INVALID_CREDENTIALS: {
    error: 'ADMIN.BAD_REQUEST_INVALID_CREDENTIALS',
    status: 400,
    messages: ['One or more request arguments are invalid.']
  },

  ADMIN_BAD_REQUEST_INVALID_ARGUMENTS: {
    error: 'ADMIN.BAD_REQUEST_INVALID_ARGUMENTS',
    status: 400,
    messages: ['Login failed. Email and/or password is incorrect.', 'An account with this email already exists, please try again email.']
  },

  ADMIN_BAD_REQUEST_DOES_NOT_EXIST: {
    error: 'ADMIN.BAD_REQUEST_DOES_NOT_EXIST',
    status: 400,
    messages: ['Record does not exist.']
  },

  // ACCOUNT
  ADMIN_BAD_REQUEST_ACCOUNT_INACTIVE: {
    error: 'ADMIN.BAD_REQUEST_ACCOUNT_INACTIVE',
    status: 400,
    messages: ['Login failed. Account is inactive.']
  },

  ADMIN_BAD_REQUEST_ACCOUNT_DELETED: {
    error: 'ADMIN.BAD_REQUEST_ACCOUNT_DELETED',
    status: 400,
    messages: ['Login failed. Account has been deleted.']
  },

  ADMIN_BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST: {
    error: 'ADMIN.BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST',
    status: 400,
    messages: ['Account does not exist.']
  }

  // place more local error codes below
};

module.exports = LOCAL_ERROR_CODES;
