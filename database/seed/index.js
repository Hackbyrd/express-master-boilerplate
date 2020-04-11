/**
 * Insert seed data into database
 *
 * Run 'yarn seed <SET> <ENV>'
 * Ex. 'yarn seed set1 development'
 * Default SET = set1
 * Default ENV = development
 */

'use strict';

// built-in
const fs = require('fs');
const path = require('path');

// set environment
process.env.NODE_ENV = process.argv[3] || 'development';

// load env
require('dotenv').config({ path: path.join(__dirname, `../../config/.${process.env.NODE_ENV}`) });

// require models
const models = require('../../models'); // grab db connection

// the order in which to create tables and add fixture data
const seq = require('../sequence');

// grab dataset
const dataset = process.argv[2] || 'set1';

/**
 * Populates database according to the seed dataset set passed in
 *
 * @setFolderName - (STRING - REQUIRED): The set folder name so we know which fixture to populate, ex. set1, set2, etc...
 *
 * return the JSON web token
 */
(async function populate(setFolderName) {
  let fixtures = []; // store array of fixture arrays
  let files = []; // file names that coorespond to the fixtures

  try {
    // turn off foreign key restrictions
    await models.db.query('SET CONSTRAINTS ALL DEFERRED');

    // load regular fixtures
    if (setFolderName !== null) {
      // folder path to test fixtures
      const setFolderPath = path.join(__dirname, setFolderName);

      // get data to insert
      fs.readdirSync(setFolderPath)
        .filter(file => file.indexOf('.js') >= 0 ) // only js files
        .forEach(file => {
          const data = require(path.join(setFolderPath, file));
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

    return Promise.resolve();
  } catch (error) {
    // turn back on foreign key restrictions
    await models.db.query('SET CONSTRAINTS ALL IMMEDIATE')
      .catch(err => Promise.reject(err));

    return Promise.reject(error);
  }
})(dataset);
