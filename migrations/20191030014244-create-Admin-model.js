'use strict';

const { randomString } = require('../helpers/logic');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Admins', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'UTC'
      },

      locale: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'en'
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      // The unique email of the user
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },

      // The unique phone of the user
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },

      // salt should be randomly generate
      salt: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        defaultValue: randomString({ len: 128, uppercase: true, numbers: true, special: true })
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      // A token to help facilitate changing passwords
      passwordResetToken: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
        defaultValue: null
      },

      // When the new password will expire
      passwordResetExpire: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      },

      // Whether user has accepted terms or not
      acceptedTerms: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      // The number of times the user has logged in
      loginCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: true
        }
      },

      // The last time the user has logged in
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
          isDate: true
        }
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
          isDate: true
        }
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Admins');
  }
};
