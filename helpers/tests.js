/**
 * Helpers for tests
 */

'use strict';

// built-in
const fs = require('fs');
const path = require('path');

// third-party
const async = require('async');

// require models
const models = require('../models'); // grab db connection

// the order in which to create tables and add fixture data
const seq = require('../database/sequence');

module.exports = {
  adminLogin,
  userLogin,
  reset,
  populate
};

/**
 * Log an admin in
 *
 * @app - (OBJECT - REQUIRED): The express server
 * @version - (STRING - REQUIRED): The api version
 * @request - (OBJECT - REQUIRED): The supertest request object
 * @admin - (OBJECT - REQUIRED): The admin fixture to login
 *
 * return the JSON web token
 */
function adminLogin(app, version, request, admin, callback) {
  request(app)
    .post(`${version}/admins/login`)
    .send({
      email: admin.email,
      password: admin.password
    })
    .end((err, res) => {
      if (err) {
        throw err;
      }

      return callback(err, res, res.body.token);
    }); // END login request
}

/**
 * Log a user in
 *
 * @app - (OBJECT - REQUIRED): The express server
 * @version - (STRING - REQUIRED): The api version
 * @request - (OBJECT - REQUIRED): The supertest request object
 * @admin - (OBJECT - REQUIRED): The admin fixture to login
 *
 * return the JSON web token
 */
function userLogin(app, version, request, user, callback) {
  request(app)
    .post(`${version}/users/login`)
    .send({
      email: user.email,
      password: user.password
    })
    .end((err, res) => {
      if (err) {
        throw err;
      }

      return callback(err, res, res.body.token);
    }); // END login request
}

/**
 * Reset the test database
 * Clear all fixture data
 */
function reset(callback) {
  models.db
    .authenticate()
    .then(() => {
      // make sure all tables are created before testing starts
      models.db
        .sync({
          force: true // destroys and recreates all tables
        })
        .then(() => callback())
        .catch(err => {
          console.log(err);
          process.exit(1);
        });
    })
    .catch(err => {
      console.log(err);
      process.exit(1);
    });
}

// populate all fixtures
function populate(fixtureFolder, callback) {
  var fixtures = []; // store array of fixture arrays
  var files = []; // file names that coorespond to the fixtures

  // turn off foreign key restrictions
  models.db.query('SET CONSTRAINTS ALL DEFERRED').spread((results, metadata) => {
    // folder path to shared seed fixtures
    // var sharedFixturesFolderPath = path.join(__dirname, '../test/fixtures', 'shared');

    // // get fixtures from shared to insert
    // fs.readdirSync(sharedFixturesFolderPath).filter(function(file) {
    //   return file.indexOf('.js') >= 0; // only js files
    // }).forEach(function(file) {
    //   var data = require(path.join(sharedFixturesFolderPath, file));
    //   fixtures.push(data);
    //   files.push(file.replace('.js', '')); // remove '.js'
    // });

    // load regular fixtures
    if (fixtureFolder !== null) {
      // folder path to test fixtures
      var fixturesFolderPath = path.join(__dirname, '../test', 'fixtures', fixtureFolder);

      // get data to insert
      fs.readdirSync(fixturesFolderPath)
        .filter(file => {
          return file.indexOf('.js') >= 0; // only js files
        })
        .forEach(file => {
          var data = require(path.join(fixturesFolderPath, file));
          fixtures.push(data);
          files.push(file.replace('.js', '')); // remove '.js'
        });
    } // end load regular fixtures

    var idx = 0; // index
    var orderedFixtures = [];
    var orderedFiles = [];

    // order the files
    for (let i = 0; i < seq.length; i++) {
      for (let j = 0; j < files.length; j++) {
        if (seq[i] === files[j]) {
          orderedFixtures.push(fixtures[j]);
          orderedFiles.push(files[j]);
          break;
        }
      }
    }

    // reorder
    fixtures = orderedFixtures;
    files = orderedFiles;

    // populate database for each fixture
    async.eachSeries(
      fixtures,
      (fixture, next) => {
        // console.log(files[idx]); // uncomment to check which model fails to insert

        // bulk create
        models[files[idx]]
          .bulkCreate(fixture, {
            validate: true,
            // hooks: true,
            individualHooks: true
          })
          .then(() => {
            const tableName = models[files[idx]].getTableName(); // grab tablename of model

            // set table ID sequence to the highest so far
            models.db
              .query('SELECT setval(\'"' + tableName + '_id_seq"\', (SELECT MAX(id) FROM "' + tableName + '"));')
              .spread((results, metadata) => {
                idx++; // increase counter
                return next(null);
              })
              .catch(err => next(err));
          })
          .catch(err => {
            idx++; // increase counter
            return next(err);
          });
      },
      err => {
        if (err) {
          console.log(err);
          throw err;
        }

        // turn back on foreign key restrictions
        models.db.query('SET CONSTRAINTS ALL IMMEDIATE').spread((results, metadata) => callback(err));
      }
    );
  });
}
