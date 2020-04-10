/**
 * Generates / deletes a feature folder
 * !IMPORTANT: MAKE SURE NAME IS SINGULAR AND PASCAL CASE!
 *
 * node app/generate generate [NEW_FEATURE_FOLDER_NAME]
 * node app/generate stringify [PATH_OF_FILE_TO_STRINGIFY]
 * node app/generate delete [NEW_FEATURE_FOLDER_NAME]
 *
 * yarn gen [NEW_FEATURE_FOLDER_NAME]
 * yarn str [PATH_OF_FILE_TO_STRINGIFY]
 * yarn del [NEW_FEATURE_FOLDER_NAME]
 */

'use strict';

// built in modules
const fs = require('fs');
const path = require('path');
const method = process.argv[2].trim(); // choose the method ['generate', 'delete', 'stringify']

// helpers
const { LOCALES, LANGUAGES } = require('../helpers/constants');

// choose which method to run
if (method === 'generate')
  generate();
else if (method === 'delete')
  destroy();
else
  stringify();

/**
 * 1. Generate Feature Folder
 * 2. Generate Test Folder
 * 3. Update database/sequence.js
 */
function generate() {
  const newDir = process.argv[3]; // NEW_FEATURE
  const newDirPath = path.join(__dirname, newDir);
  const newTestDirPath = path.join(__dirname, '../test/app', newDir);

  console.log('Generating ' + newDir + ' feature...');

  // if directory already exists
  if (fs.existsSync(newDirPath)) {
    console.log('Error: ' + newDir + ' feature already exists. Please use different name.');
    process.exit(1);
  }

  // names
  const upperName = newDir.toUpperCase();
  const lowerName = newDir.toLowerCase();
  const pascalName = newDir[0].toUpperCase() + '' + newDir.substring(1);
  const camelName = newDir[0].toLowerCase() + '' + newDir.substring(1);

  // make directory
  fs.mkdirSync(newDirPath);

  /****************************/
  /***** Create App Files *****/
  /****************************/
  let fd = null; // file descriptor

  /***** Controller *****/
  fd = fs.openSync(path.join(newDirPath, 'controller.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} CONTROLLER\n *\n * Defines which ${pascalName} service methods are called based on the type of user role\n */\n\n'use strict';\n\n// helpers\nconst { errorResponse, ERROR_CODES } = require('../../services/error');\n\n// service\nconst service = require('./service');\n\nmodule.exports = {\n  V1Example\n}\n\n/**\n * Example Method\n *\n * /v1/${lowerName}s/example\n *\n * Must be logged out | Must be logged in | Can be both logged in or logged out\n * Roles: ['admin', 'user']\n */\nasync function V1Example(req, res, next) {\n  let method = null; // which service method to use\n\n  // Call the correct service method based on type of user of role\n  if (req.admin)\n    method = \`V1ExampleByAdmin\`;\n  else if (req.user)\n    method = \`V1ExampleByUser\`;\n  else\n    return res.status(401).json(errorResponse(req, ERROR_CODES.UNAUTHORIZED));\n\n  // call correct method\n  const result = await service[method](req).catch(err => next(err));\n  return res.status(result.status).json(result);\n}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Helper *****/
  fd = fs.openSync(path.join(newDirPath, 'helper.js'), 'w');
  fs.writeSync(fd, `/**\n * ${upperName} HELPER\n */\n\n'use strict';\n\nmodule.exports = {}\n`, 0, 'utf-8');
  fs.closeSync(fd);

  /***** Model *****/
  fd = fs.openSync(path.join(newDirPath, 'model.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} MODEL\n *\n * Find Table Schema Here: "/database/schema.sql"\n */\n\n'use strict';\n\n// require custom node modules\nconst constants = require('../../helpers/constants');\n\nmodule.exports = (sequelize, DataTypes) => {\n  const ${pascalName} = sequelize.define('${camelName}', {\n\n    // All foreign keys are added in associations\n\n    example1: {\n      type: DataTypes.BOOLEAN,\n      allowNull: false,\n      defaultValue: true\n    },\n\n    example2: {\n      type: DataTypes.INTEGER,\n      allowNull: false,\n      defaultValue: 0,\n      validate: {\n        isInt: true\n      }\n    },\n\n    example3: {\n      type: DataTypes.DECIMAL(4, 2),\n      allowNull: false,\n      defaultValue: 0.00,\n      validate: {\n        isDecimal: true\n      },\n      get() {\n        // convert string to float\n        const rawValue = this.getDataValue(example3);\n        return Number(rawValue);\n      }\n    },\n\n    example4: {\n      type: DataTypes.STRING,\n      allowNull: false,\n      defaultValue: 'foo'\n    },\n\n    example5: {\n      type: DataTypes.ENUM(constants.someList),\n      allowNull: true,\n      defaultValue: null\n    },\n\n    example6: {\n      type: DataTypes.DATE,\n      allowNull: false,\n      defaultValue: DataTypes.NOW, // now\n      validate: {\n        isDate: true\n      }\n    },\n\n    example7: {\n      type: DataTypes.JSONB,\n      allowNull: true,\n      defaultValue: null\n    },\n\n    example8: {\n      type: DataTypes.TEXT,\n      allowNull: true,\n      defaultValue: null\n    }\n  }, {\n    timestamps: true, // allows sequelize to create timestamps automatically\n    freezeTableName: true, // allows sequelize to pluralize the model name\n    tableName: '${pascalName}s', // define table name, must be PascalCase!\n    hooks: {},\n    indexes: []\n  });\n\n  return ${pascalName};\n}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Routes *****/
  const version = 'v1'; // route version number

  fd = fs.openSync(path.join(newDirPath, 'routes.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} ROUTES\n *\n * This is where we define all the routes for the ${pascalName} feature.\n * These routes get exported to the global /routes.js file.\n */\n\n'use strict';\n\n// require controller\nconst controller = require('./controller');\n\n// Returns a function that attaches ${pascalName} feature routes to the global router object\nmodule.exports = (passport, router) => {\n\n  // routes\n  router.all('/${version}/${lowerName}s/example', controller.V1Example);\n\n  // return router\n  return router;\n};\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Error *****/
  fd = fs.openSync(path.join(newDirPath, 'error.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} ERROR\n *\n * For Better Client 4xx Error Handling For ${pascalName} Feature\n * Gets exported to /services/error.js and put in the global variable ERROR_CODES\n */\n\n'use strict';\n\n/**\n * ${pascalName} Feature Local Error Codes\n */\nconst LOCAL_ERROR_CODES = {\n  /* Place error codes below. Remember to prepend ${upperName} to the key and error value  */\n  // ${upperName}_BAD_REQUEST_ACCOUNT_INACTIVE: {\n  //   error: '${upperName}.BAD_REQUEST_ACCOUNT_INACTIVE',\n  //   status: 401,\n  //   messages: ['${upperName}[Account is not active]']\n  // }\n};\n\nmodule.exports = LOCAL_ERROR_CODES;\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Processor *****/
  fd = fs.openSync(path.join(newDirPath, 'processor.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} BACKGROUND PROCESSOR\n *\n * This is where we process background tasks for the ${pascalName} feature.\n * Gets exported to /worker.js to be run in a worker process.\n */\n\n'use strict';\n\n// built-in node modules\nconst path = require('path');\n\n// ENV variables\nconst { REDIS_URL } = process.env;\n\n// third party node modules\nconst Queue = require('bull'); // process background tasks from Queue\nconst ${pascalName}Queue = new Queue('${pascalName}Queue', REDIS_URL);\n\n// Function is called in /worker.js\nmodule.exports = () => {\n\n  // Process ${pascalName} Feature Background Tasks\n  ${pascalName}Queue.process('V1ExampleTask', 1, path.join(__dirname, 'tasks/V1ExampleTask.js'));\n\n  // place future tasks here\n}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /*********************************/
  /***** Create Language Files *****/
  /*********************************/

  // make language directory
  const newLangDirPath = path.join(newDirPath, 'language');
  fs.mkdirSync(newLangDirPath);

  // create each language file
  for (let i = 0; i < LOCALES.length; i++) {
    const locale = LOCALES[i];
    const language = LANGUAGES[i];

    fd = fs.openSync(path.join(newLangDirPath, `${locale}.js`), 'w');
    fs.writeSync(
      fd,
      `/**\n * ${pascalName} Language File: ${language}\n *\n * This file holds all ${language} language translations for the ${pascalName} feature.\n * This file is compiled by /services/language.js to generate the final ${language} locale\n * All ${language} translations aggregated from all features can be found in /locales/${locale}.json\n */\n\n'use strict';\n\nmodule.exports = {\n  '${upperName}[Example Message]': 'Example Messagea'\n};\n`,
      0,
      'utf-8'
    );
    fs.closeSync(fd);
  }

  /********************************/
  /***** Create Service Files *****/
  /********************************/
  fs.mkdirSync(path.join(newDirPath, 'service'));

  // service index
  fd = fs.openSync(path.join(newDirPath, 'service/index.js'), 'w');
  fs.writeSync(fd, `/**\n * ${upperName} SERVICE\n */\n\n'use strict';\n\nmodule.exports = {\n  ...require('./V1Method')\n}\n`, 0, 'utf-8');
  fs.closeSync(fd);

  // service method
  fd = fs.openSync(path.join(newDirPath, 'service/V1Method.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} V1Method SERVICE\n */\n\n'use strict';\n\n// ENV variables\nconst { NODE_ENV, REDIS_URL } = process.env;\n\n// third-party\nconst _ = require('lodash');\nconst Op = require('sequelize').Op; // for operator aliases like $gte, $eq\nconst io = require('socket.io-emitter')(REDIS_URL); // to emit real-time events to client\nconst joi = require('@hapi/joi'); // validations\nconst async = require('async');\nconst moment = require('moment-timezone');\nconst passport = require('passport');\nconst currency = require('currency.js');\n\n// services\nconst email = require('../../../services/email');\nconst { SOCKET_ROOMS, SOCKET_EVENTS } = require('../../../services/socket');\nconst { errorResponse, joiErrorsMessage, ERROR_CODES } = require('../../../services/error');\n\n// models\nconst models = require('../../../models');\n\n// helpers\nconst { getOffset, getOrdering, convertStringListToWhereStmt } = require('../../../helpers/cruqd');\nconst { randomString } = require('../../../helpers/logic');\nconst { LIST_INT_REGEX } = require('../../../helpers/constants');\n\n// methods\nmodule.exports = {}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  console.log(`Created ${newDirPath}`);

  /******************************/
  /***** Create Tasks Files *****/
  /******************************/

  /*****************************/
  /***** Create Test Files *****/
  /*****************************/

  // make test directory
  fs.mkdirSync(newTestDirPath);

  // create test files
  fs.mkdirSync(path.join(newTestDirPath, 'integration'));
  fd = fs.openSync(path.join(newTestDirPath, 'integration/V1Method.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * TEST ${newDir.toUpperCase()} V1Method METHOD\n */\n\n'use strict';\n\n// build-in node modules\nconst path = require('path');\n\n// load test env\nrequire('dotenv').config({ path: path.join(__dirname, '../../../../config/.env.test') });\n\n// ENV variables\nconst { NODE_ENV } = process.env;\n\n// third party\nconst moment = require('moment-timezone');\nconst i18n = require('i18n');\n\n// server & models\nconst app = require('../../../../server');\nconst models = require('../../../../models');\n\n// assertion library\nconst { expect } = require('chai');\nconst request = require('supertest');\n\n// services\nconst { errorResponse, ERROR_CODES } = require('../../../../services/error');\n\n// helpers\nconst { adminLogin, userLogin, reset, populate } = require('../../../../helpers/tests');\n\ndescribe('${pascalName}.V1Method', () => {\n  // grab fixtures here\n  const adminFix = require('../../../fixtures/fix1/admin');\n  const userFix = require('../../../fixtures/fix1/user');\n\n  // url of the api method we are testing\n  const routeVersion = '/v1';\n  const routePrefix = '/MAKE ${upperName} PLURAL';\n  const routeMethod = '/method';\n  const routeUrl = \`\${routeVersion}\${routePrefix}\${routeMethod}\`;\n\n  // clear database\n  beforeEach(done => {\n    reset(done);\n  });\n\n  // Logged Out\n  describe('Role: Logged Out', () => {\n    // populate database with fixtures\n    beforeEach(done => {\n      populate('fix1', done);\n    });\n\n    it('should test something', done => {\n      done();\n    }); // END should test something\n  }); // END Role: Logged Out\n\n  // Role: Admin\n  describe('Role: Admin', () => {\n    const jwt = 'jwt-admin';\n\n    // populate database with fixtures\n    beforeEach(done => {\n      populate('fix1', done);\n    });\n\n    it('should test something', done => {\n      done();\n    }); // END should test something\n  }); // END Role: Admin\n\n  // Role: User\n  describe('Role: User', () => {\n    const jwt = 'jwt-user';\n\n    // populate database with fixtures\n    beforeEach(done => {\n      populate('fix1', done);\n    });\n\n    it('should test something', done => {\n      done();\n    }); // END should test something\n  }); // END Role: User\n}); // END ${pascalName}.V1Method\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  fs.closeSync(fs.openSync(path.join(newTestDirPath, 'helper.js'), 'w'));
  fs.closeSync(fs.openSync(path.join(newTestDirPath, 'service.js'), 'w'));

  console.log(`Created ${newTestDirPath}`);

  /******************************/
  /***** Update Sequence.js *****/
  /******************************/
  const sequenceArray = require('../database/sequence');

  // add new feature name
  sequenceArray.push(camelName);
  const featureNames = sequenceArray.map(name => `'${name}'`).join(', ');

  fd = fs.openSync(path.join(__dirname, '../database/sequence.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * This is the table order in which test fixture and seed data is added into the database.\n * Make sure to do MODEL NAME (Lower-case & Singular)!!! DO NOT DO TABLE NAME (Pascal-case & Plural)\n */\n\nmodule.exports = [${featureNames}];\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  console.log(`Added '${camelName}' to database/sequence.js`);

  // Finished
  console.log(newDir + ' feature generated!');
}

/**
 * 1. Deletes Feature Folder
 * 2. Deletes Test Folder
 * 3. Updates database/sequence.js
 */
function destroy() {
  const rmDir = process.argv[3]; // NEW_FEATURE
  const rmDirPath = path.join(__dirname, rmDir);
  const rmTestDirPath = path.join(__dirname, '../test/app', rmDir);
  const camelName = rmDir[0].toLowerCase() + '' + rmDir.substring(1);

  console.log('Deleting ' + rmDir + ' feature...');

  // if directory exists
  if (!fs.existsSync(rmDirPath)) {
    console.log('Error: ' + rmDir + ' feature does not exists.');
    process.exit(1);
  }

  // delete app/Feature
  fs.rmdirSync(rmDirPath, { recursive: true });
  console.log(`Deleted ${rmDirPath}`);

  // delete test/app/Feature
  fs.rmdirSync(rmTestDirPath, { recursive: true });
  console.log(`Deleted ${rmTestDirPath}`);

  // remove feature name from database/sequence.js
  const sequenceArray = require('../database/sequence');
  sequenceArray.splice(sequenceArray.indexOf(camelName), 1);
  const featureNames = sequenceArray.map(name => `'${name}'`).join(', ');

  // file descriptor
  let fd = fs.openSync(path.join(__dirname, '../database/sequence.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * This is the table order in which test fixture and seed data is added into the database.\n * Make sure to do MODEL NAME (Lower-case & Singular)!!! DO NOT DO TABLE NAME (Pascal-case & Plural)\n */\n\nmodule.exports = [${featureNames}];\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  console.log(`Removed '${camelName}' from database/sequence.js`);

  // Finished
  console.log(rmDir + ' feature deleted!');
}

// takes in a file path and stringifies it to help with writing the generate and delete functions above
function stringify() {
  const filePath = process.argv[3]; // the file path of the file to stringify
  let fileText = fs.readFileSync(filePath, 'utf8');
  fileText = fileText.replace(/\n/g, '\\n').replace(/`/g, '\\`'); //.replace(/\${/g, '\\${');

  console.log(fileText);
}
