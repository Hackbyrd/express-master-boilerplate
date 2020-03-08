/**
 * Generate a features folder. MAKE SURE NAME IS SINGULAR!
 *
 * node app/generate generate [NEW_FEATURE_FOLDER_NAME]
 * node app/generate stringify [PATH_OF_FILE_TO_STRINGIFY]
 *
 * yarn gen [NEW_FEATURE_FOLDER_NAME]
 * yarn str [PATH_OF_FILE_TO_STRINGIFY]
 */

'use strict';

// built in modules
const fs = require('fs');
const path = require('path');
const method = process.argv[2]; // choose the method ['generate', 'stringify']

// choose which method to run
if (method === 'stringify') stringify();
else generate();

// generate feature folders and test folder
function generate() {
  const newDir = process.argv[3]; // NEW_FEATURE
  const newDirPath = path.join(__dirname, newDir);
  const newTestDirPath = path.join(__dirname, '../test/app', newDir);

  console.log('Generating ' + newDir + ' feature...');

  // if directiory oes not
  if (fs.existsSync(newDirPath)) {
    console.log('Error: ' + newDir + ' already exists. Please use different name');
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
    `/**\n * ${upperName} CONTROLLER\n */\n\n'use strict';\n\n// helpers\nconst { errorResponse, ERROR_CODES } = require('../../services/error');\n\n// service\nconst service = require('./service');\n\nmodule.exports = {}\n`,
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
    `/* ${newDir} Model\n\nFind Table Schema Here: "/database/schema.sql"\n\n*/\n\n'use strict';\n\n// require custom node modules\nconst constants = require('../../helpers/constants');\n\nmodule.exports = function(sequelize, DataTypes) {\n  const ${pascalName} = sequelize.define('${camelName}', {\n\n    // All foreign keys are added in associations\n\n    example1: {\n      type: DataTypes.BOOLEAN,\n      allowNull: false,\n      defaultValue: true\n    },\n\n    example2: {\n      type: DataTypes.INTEGER,\n      allowNull: false,\n      defaultValue: 0,\n      validate: {\n        isInt: true\n      }\n    },\n\n    example3: {\n      type: DataTypes.DECIMAL(4, 2),\n      allowNull: false,\n      defaultValue: 0.00,\n      validate: {\n        isDecimal: true\n      }\n    },\n\n    example4: {\n      type: DataTypes.STRING,\n      allowNull: false,\n      defaultValue: 'foo'\n    },\n\n    example5: {\n      type: DataTypes.ENUM(constants.someList),\n      allowNull: true,\n      defaultValue: null\n    },\n\n    example6: {\n      type: DataTypes.DATE,\n      allowNull: false,\n      defaultValue: DataTypes.NOW, // now\n      validate: {\n        isDate: true\n      }\n    },\n\n    example7: {\n      type: DataTypes.JSONB,\n      allowNull: true,\n      defaultValue: null\n    },\n\n    example8: {\n      type: DataTypes.TEXT,\n      allowNull: true,\n      defaultValue: null\n    }\n  }, {\n    timestamps: true, // allows sequelize to create timestamps automatically\n    freezeTableName: true, // allows sequelize to pluralize the model name\n    tableName: 'MAKE ${upperName} PLURAL', // set table name\n    hooks: {},\n    indexes: []\n  });\n\n  return ${pascalName};\n}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Routes *****/
  fd = fs.openSync(path.join(newDirPath, 'routes.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} ROUTES\n */\n\n'use strict';\n\n// require controller\nconst controller = require('./controller');\n\n// require middleware\nconst { JWTAuth, verifyJWTAuth } = require('../../middleware/auth');\n\nmodule.exports = (passport, router)  => {\n\n  // routes\n  // router.all('/FEATURE/METHOD1', controller.V1Method1);\n  // router.all('/FEATURE/METHOD2', JWTAuth, verifyJWTAuth, controller.V1Method2);\n\n  // return router\n  return router;\n}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Error *****/
  fd = fs.openSync(path.join(newDirPath, 'error.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${pascalName} Error Service:\n *\n * For Better Client 4xx Error Handling For ${pascalName} Feature\n * Gets exported to /services/error.js and put in variable ERROR_CODES\n */\n\n'use strict';\n\n/**\n * ${pascalName} Local Error Codes\n */\nconst LOCAL_ERROR_CODES = {\n  /* Place error codes below. Remember to prepend ${upperName} to the key and error value  */\n  // ${upperName}_BAD_REQUEST_ACCOUNT_INACTIVE: {\n  //   error: '${upperName}.BAD_REQUEST_ACCOUNT_INACTIVE',\n  //   status: 401,\n  //   messages: ['${pascalName} account is inactive.']\n  // }\n};\n\nmodule.exports = LOCAL_ERROR_CODES;\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

  /***** Service *****/
  fs.mkdirSync(path.join(newDirPath, 'service'));

  // service index
  fd = fs.openSync(path.join(newDirPath, 'service/index.js'), 'w');
  fs.writeSync(fd, `/**\n * ${upperName} SERVICE\n */\n\n'use strict';\n\nmodule.exports = {\n  ...require('./V1Method')\n}\n`, 0, 'utf-8');
  fs.closeSync(fd);

  // service method
  fd = fs.openSync(path.join(newDirPath, 'service/V1Method.js'), 'w');
  fs.writeSync(
    fd,
    `/**\n * ${upperName} V1Method SERVICE\n */\n\n'use strict';\n\n// ENV variables\nconst { NODE_ENV, REDIS_URL } = process.env;\n\n// third-party\nconst _ = require('lodash');\nconst Op = require('sequelize').Op; // for operator aliases like $gte, $eq\nconst io = require('socket.io-emitter')(REDIS_URL); // to emit real-time events to client\nconst joi = require('@hapi/joi'); // validations\nconst async = require('async');\nconst moment = require('moment-timezone');\nconst passport = require('passport');\nconst currency = require('currency.js');\n\n// services\nconst email = require('../../../services/email');\nconst { SOCKET_ROOMS, SOCKET_EVENTS } = require('../../../services/socket');\nconst { errorResponse, joiErrorsMessage, ERROR_CODES } = require('../../../services/error');\n\n// models\nconst models = require('../../../models');\n\n// helpers\nconst { getOffset, getOrdering, convertStringListToWhereStmt } = require('../../../helpers/cruqd');\nconst { randomString } = require('../../../helpers/logic');\nconst { listIntRegex } = require('../../../helpers/constants');\n\n// methods\nmodule.exports = {}\n`,
    0,
    'utf-8'
  );
  fs.closeSync(fd);

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

  console.log(newDir + ' feature generated successfully!');
  console.log('REMINDER: Remember to add MODEL NAME to database/sequence.js for testing purposes!');
}

// takes in a file path and stringifies
function stringify() {
  const filePath = process.argv[3]; // the file path of the file to stringify
  let fileText = fs.readFileSync(filePath, 'utf8');
  fileText = fileText.replace(/\n/g, '\\n').replace(/`/g, '\\`'); //.replace(/\${/g, '\\${');

  console.log(fileText);
}
