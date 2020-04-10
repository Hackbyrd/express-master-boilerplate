/**
 * User Error Service:
 *
 * For Better Client 4xx Error Handling For User Feature
 * Gets exported to /services/error.js and put in variable ERROR_CODES
 */

'use strict';

/**
 * User Local Error Codes
 */
const LOCAL_ERROR_CODES = {
  /* Place error codes below. Remember to prepend USER to the key and error value  */
  // USER_BAD_REQUEST_ACCOUNT_INACTIVE: {
  //   error: 'USER.BAD_REQUEST_ACCOUNT_INACTIVE',
  //   status: 401,
  //   messages: ['User account is inactive.']
  // }
};

module.exports = LOCAL_ERROR_CODES;
