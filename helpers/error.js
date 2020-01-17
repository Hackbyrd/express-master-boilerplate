/**
 * Error related helpers
 */

'use strict';

/**
 * Error Codes
 *
 * Error code object contains one code and multiple messages.
 * You can choose which message you want to use by passing in the message index to the errRes method
 */
const ERROR_CODES = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    messages: ['You do not have permission to make this request.']
  },

  BAD_REQUEST_INVALID_CREDENTIALS: {
    code: 'BAD_REQUEST_INVALID_CREDENTIALS',
    messages: ['One or more request arguments are invalid.']
  },

  BAD_REQUEST_INVALID_ARGUMENTS: {
    code: 'BAD_REQUEST_INVALID_ARGUMENTS',
    messages: ['Login failed. Email and/or password is incorrect.', 'An account with this email already exists, please try again email.']
  },

  BAD_REQUEST_ACCOUNT_INACTIVE: {
    code: 'BAD_REQUEST_ACCOUNT_INACTIVE',
    messages: ['Login failed. Account is inactive.']
  },

  BAD_REQUEST_ACCOUNT_DELETED: {
    code: 'BAD_REQUEST_ACCOUNT_DELETED',
    messages: ['Login failed. Account has been deleted.']
  },

  BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST: {
    code: 'BAD_REQUEST_ACCOUNT_DOES_NOT_EXIST',
    messages: ['Account does not exist.']
  }
};

module.exports = {
  errRes,
  joiErrors,
  ERROR_CODES
};

/**
 * Takes in an ERROR_CODE and returns an object to return in the response json
 *
 * @i18n - (OBJECT - REQUIRED): the language library
 * @status - (NUMBER - REQUIRED): the http status code, 400
 * @errorCode - (ERROR_CODE OBJECT - REQUIRED): the error code to use
 * @messageIndex - (NUMBER - OPTIONAL) [DEFAULT - 0]: which message to use
 * @customMessage - (STRING - OPTIONAL): A custom message to override default message. SHOULD NOT have i18n language wrapper because it should be called outside of this function
 *
 * return { status, success, error, message }
 */
function errRes(i18n, status, errorCode, messageIndex = 0, customMessage) {
  return {
    status: status,
    success: false,
    error: errorCode.code,
    message: customMessage || i18n.__(errorCode.messages[messageIndex])
  };
}

/**
 * Combine error messages into one string from joi errors object
 *
 * @errors (ARRAY OBJECTS - REQUIRED): The error message ex. { details: [{ message: '' }, { message: '' }] }
 *
 * return combined message
 * return null if no errors
 *
 * Test
 */
function joiErrors(errors) {
  if (!errors) return null;

  return errors.details.map(e => e.message).join(', ');
}
