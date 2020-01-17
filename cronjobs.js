/**
 * Run all cronjobs
 * https://devcenter.heroku.com/articles/scheduled-jobs-custom-clock-processes
 * https://www.npmjs.com/package/cron
 * This is the clock process on heroku
 *
 * Important! - Should only have 1 dyno process running for this. heroku ps:scale clock=1
 */

'use strict';

// build-in node modules
const path = require('path');

// third party node modules
const CronJob = require('cron').CronJob;
const request = require('request');

// load dev env
if (process.env.NODE_ENV === 'development') require('dotenv').config({ path: path.join(__dirname, './config/.env.development') });

// ENV variables
const { NODE_ENV, HOSTNAME, CRONJOB_KEY } = process.env;

// send cronjob request
function call(method) {
  request.post(
    `${HOSTNAME}${method}`,
    {
      form: {
        key: CRONJOB_KEY
      }
    },
    (err, res, body) => {
      if (err) console.log(err);

      console.log(`Called ${method} - ${body}`);
    }
  );
}

/************************/
/***** FEATURE_NAME *****/
/************************/

// Example automatically make request. Run every 5 mins.
// new CronJob('0 0,5,10,15,20,25,30,35,40,45,50,55 * * * *', () => { call('/route/method'); }, null, true, 'UTC');
