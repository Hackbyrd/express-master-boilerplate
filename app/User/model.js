/* User Model

Find Table Schema Here: "/database/schema.sql"

*/

'use strict';

// require custom node modules
const constants = require('../../helpers/constants');

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {

    // All foreign keys are added in associations

    example1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    example2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true
      }
    },

    example3: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        isDecimal: true
      }
    },

    example4: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'foo'
    },

    example5: {
      type: DataTypes.ENUM(constants.someList),
      allowNull: true,
      defaultValue: null
    },

    example6: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // now
      validate: {
        isDate: true
      }
    },

    example7: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    },

    example8: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    }
  }, {
    timestamps: true, // allows sequelize to create timestamps automatically
    freezeTableName: true, // allows sequelize to pluralize the model name
    tableName: 'MAKE USER PLURAL', // set table name
    hooks: {},
    indexes: []
  });

  return User;
}
