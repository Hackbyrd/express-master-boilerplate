/**
 * Client Error Service:
 *
 * For Better Client 4xx Error Handling
 */

'use strict';

// require built-in node modules
const fs = require('fs');
const path = require('path');

// variables
const APP_DIR = '../app'; // app directory
const ERROR_FILE = 'error.js'; // the error file name

/**
 * Global Error Codes
 *
 * Error code object contains one error code and multiple messages.
 * You can choose which message you want to use by passing in the message index to the errorResponse method
 * Add more custom global error codes here
 */
const ERROR_CODES = {
  UNAUTHORIZED: {
    error: 'UNAUTHORIZED',
    status: 401,
    messages: ['You do not have permission to make this request.']
  },

  BAD_REQUEST_INVALID_ARGUMENTS: {
    error: 'BAD_REQUEST_INVALID_ARGUMENTS',
    status: 400,
    messages: ['One or more request arguments are invalid.']
  }

  //-- ADD MORE ERROR CODES BELOW --//
};

// check if is directory and get directories
const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);
const directories = getDirectories(path.join(__dirname, APP_DIR));

// add each error to models object
directories.forEach(dir => {
  fs.readdirSync(dir)
    .filter(file => file === ERROR_FILE)
    .forEach(file => {
      // read error file
      const LOCAL_ERROR_CODES = require(`${dir}/${ERROR_FILE}`);

      // add local error codes to global error codes
      Object.keys(LOCAL_ERROR_CODES).forEach(key => {
        ERROR_CODES[key] = LOCAL_ERROR_CODES[key];
      });
    });
});

/**
 * Takes in an ERROR_CODE and returns an object to return in the response json
 *
 * @i18n - (OBJECT - REQUIRED): the language library
 * @errorCode - (ERROR_CODE OBJECT - REQUIRED): the error code to use
 * @errorMessage - (STRING/NUMBER - OPTIONAL) [DEFAULT - 0]: A custom message to override default message. SHOULD NOT have i18n language wrapper because it should be called outside of this function. If int, then use the messages array to get the correct error message
 * @statusCode - (NUMBER - OPTIONAL): the http status code, 400, to override the default
 *
 * return { success, status, error, message }
 */
function errorResponse(i18n, errorCode, errorMessage = 0, statusCode) {
  return {
    success: false,
    status: statusCode || errorCode.status,
    error: errorCode.error,
    message: typeof errorMessage === 'number' ? i18n.__(errorCode.messages[errorMessage]) : errorMessage
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
 * TODO: Test
 */
function joiErrorsMessage(errors) {
  if (!errors) return null;

  return errors.details.map(e => e.message).join(', ');
}

// export
module.exports = {
  ERROR_CODES,
  errorResponse,
  joiErrorsMessage
};
