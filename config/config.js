'use strict';

const path = require('path');
const { NODE_ENV } = process.env;

// if undefined or development, default to development
if (NODE_ENV === undefined || NODE_ENV === 'development') require('dotenv').config({ path: path.join(__dirname, '.env.development') });
// if test
else if (NODE_ENV === 'test') require('dotenv').config({ path: path.join(__dirname, '.env.test') });

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres'
  },

  test: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres'
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',

    // https://github.com/sequelize/cli/issues/154
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true
      }
    }
  }
};
