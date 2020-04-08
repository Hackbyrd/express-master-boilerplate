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
async function adminLogin(app, version, request, admin) {
  try {
    // login request
    const response = request(app)
      .post(`${version}/admins/login`)
      .send({
        email: admin.email,
        password: admin.password
      });

    return Promise.resolve({
      token: response.body.token,
      response
    });
  } catch (error) {
    return Promise.reject(error);
  }

  // request(app)
  //   .post(`${version}/admins/login`)
  //   .send({
  //     email: admin.email,
  //     password: admin.password
  //   })
  //   .end((err, res) => {
  //     if (err) {
  //       throw err;
  //     }

  //     return callback(err, res, res.body.token);
  //   }); // END login request
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
 *
 * Clear all fixture data, throws error automatically if there is one
 */
async function reset() {
  await models.db.authenticate();
  await models.db.sync({ force: true });
}

// populate all fixtures
function populateOld(fixtureFolder, callback) {
  let fixtures = []; // store array of fixture arrays
  let files = []; // file names that coorespond to the fixtures

  // turn off foreign key restrictions
  models.db.query('SET CONSTRAINTS ALL DEFERRED').spread((results, metadata) => {
    // load regular fixtures
    if (fixtureFolder !== null) {
      // folder path to test fixtures
      const fixturesFolderPath = path.join(__dirname, '../test', 'fixtures', fixtureFolder);

      // get data to insert
      fs.readdirSync(fixturesFolderPath)
        .filter(file => {
          return file.indexOf('.js') >= 0; // only js files
        })
        .forEach(file => {
          const data = require(path.join(fixturesFolderPath, file));
          fixtures.push(data);
          files.push(file.replace('.js', '')); // remove '.js'
        });
    } // end load regular fixtures

    let idx = 0; // index
    const orderedFixtures = [];
    const orderedFiles = [];

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

/**
 * Populates database according to the fixture set passed int
 *
 * @fixtureFolderName - (STRING - REQUIRED): The fixtures folder name so we know which fixture to populate, ex. fix1, fix2, etc...
 *
 * return the JSON web token
 */
async function populate(fixtureFolderName) {
  let fixtures = []; // store array of fixture arrays
  let files = []; // file names that coorespond to the fixtures

  try {
    // turn off foreign key restrictions
    await models.db.query('SET CONSTRAINTS ALL DEFERRED');

    // load regular fixtures
    if (fixtureFolderName !== null) {
      // folder path to test fixtures
      const fixturesFolderPath = path.join(__dirname, '../test', 'fixtures', fixtureFolderName);

      // get data to insert
      fs.readdirSync(fixturesFolderPath)
        .filter(file => file.indexOf('.js') >= 0 ) // only js files
        .forEach(file => {
          const data = require(path.join(fixturesFolderPath, file));
          fixtures.push(data);
          files.push(file.replace('.js', '')); // remove '.js'
        });
    } // end load regular fixtures

    let idx = 0; // index
    const orderedFixtures = [];
    const orderedFiles = [];

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
    for (let i = 0; i < fixtures.length; i++) {
      const fixture = fixtures[i];

      // bulk create
      await models[files[idx]]
        .bulkCreate(fixture, {
          validate: true,
          // hooks: true,
          individualHooks: true
        });

      const tableName = models[files[idx]].getTableName(); // grab tablename of model
      const queryText = `SELECT setval('"${tableName}_id_seq"', (SELECT MAX(id) FROM "${tableName}"));`;

      await models.db.query(queryText);
      idx++;
    }

    return Promise.resolve(true);
  } catch (error) {
    // turn back on foreign key restrictions
    models.db.query('SET CONSTRAINTS ALL IMMEDIATE').then(() => {
      return Promise.reject(error);
    }).catch(err => {
      return Promise.reject(err);
    });
  }
}
