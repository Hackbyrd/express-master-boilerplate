/**
 * All validating data helpers
 *
 * TODO: Test
 */

'use strict';

// moment
const moment = require('moment-timezone');

module.exports = {
  checkPasswords,
  isValidTimezone
};

/**
 * Check if passwords are the same
 * Check if passwords have at least pwMinLen characters
 * Check if passwords contain ' ' characters
 *
 * @password1: (STRING - REQUIRED) Password one.
 * @password2: (STRING - REQUIRED) Password two.
 * @pwMinLen: (NUMBER - OPTIONAL) The minimum length of the password.
 *
 * Returns true if valid
 * Returns Error message is not valid
 */
function checkPasswords(password1, password2, pwMinLen) {
  pwMinLen = pwMinLen === undefined || pwMinLen === null ? 8 : pwMinLen; // default 8

  // check equal passwords
  if (password1 !== password2)
    return 'The passwords you entered do not match.';

  // check minimum length of the password
  if (password1.length < pwMinLen)
    return 'Password length must be ' + pwMinLen + ' characters or greater.';

  // check if password has ' ' characters (white space)
  if (password1.indexOf(' ') >= 0)
    return 'Password cannot contain white spaces.';

  return true; // password is valid
}

/**
 * Takes in a timezone name and checks if it's valid
 *
 * @timezone: (STRING - REQUIRED) - the timezone name to check
 *
 * return true or false
 */
function isValidTimezone(timezone) {
  // get all timezone names in an array
  const tzNames = moment.tz.names();
  return tzNames.indexOf(timezone) >= true;
}
