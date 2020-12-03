'use strict';

// helpers
const constants = require('../helpers/constants');
const { randomString } = require('../helpers/logic');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
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

      company: {
        type: Sequelize.STRING,
        allowNull: false
      },

      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },

      lastName: {
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

      birthday: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },

      sex: {
        type: Sequelize.ENUM(constants.GENDER_LIST),
        allowNull: false,
        defaultValue: 'OTHER'
      },

      countryCode: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },

      ipAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },

      loginConfirmationToken: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
        defaultValue: null
      },

      loginConfirmationExpire: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
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

      subscribedDailyContent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      subscribedNewsletter: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      isEngineer: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },

      isDesigner: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },

      interests: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null
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
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};