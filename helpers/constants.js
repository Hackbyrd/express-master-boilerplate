/**
 * All constant variables go there
 *
 * Use ALL UPPER CASE with underscore
 */

'use strict';

// ENV variables
const { NODE_ENV } = process.env;

module.exports = {
  LOCALES: ['en', 'ko', 'zh-TW', 'zh-CN'], // first index is the default language
  LANGUAGES: ['English', 'Korean', 'Simplified Chinese', 'Traditional Chinese'], //the languages in english

  // moment.js formats
  DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DATE_TIME_FORMAT_Z: 'YYYY-MM-DD HH:mm:ss z',
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',

  // days
  DAYS_FULL: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  DAYS_HALF: ['mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun'],
  DAYS_SHORT: ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'],
  DAYS_SINGLE: ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'],

  // listsRegex
  LIST_INT_REGEX: /^\d+([,]\d+)*$/, // regex for a list integer 1,2,3,456,78
  LIST_INT_REGEX_EMPTY: /^$|^\d+([,]\d+)*$/, // regex for a list integer 1,2,3,456,78 or ''
  LIST_STRING_REGEX: /^(\w|\s|\&|\/)+([,](\w|\s|\&|\/)+)*$/, // regex for a list string 1,2,3,456,78
  LIST_STRING_REGEX_EMPTY: /^$|^(\w|\s)+([,](\w|\s)+)*$/, // regex for a list string 1,2,3,456,78 or ''
  LIST_STRING_AT_REGEX_EMPTY: /^$|^(\w|\s|@|\.)+([,](\w|\s|@|\.)+)*$/, // regex for a list string 1,2,3,456,@78 or ''

  GENDER_LIST: ['MALE', 'FEMALE', 'OTHER']
};
