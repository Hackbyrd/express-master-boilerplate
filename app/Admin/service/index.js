/**
 * ADMIN SERVICE
 */

'use strict';

// methods
module.exports = {
  V1Login: require('./V1Login').V1Login,
  V1Read: require('./V1Read').V1Read,
  V1Create: require('./V1Create').V1Create,
  V1Update: require('./V1Update').V1Update,
  V1Query: require('./V1Query').V1Query,
  V1UpdatePassword: require('./V1UpdatePassword').V1UpdatePassword,
  V1ResetPassword: require('./V1ResetPassword').V1ResetPassword,
  V1ConfirmPassword: require('./V1ConfirmPassword').V1ConfirmPassword,
  V1UpdateEmail: require('./V1UpdateEmail').V1UpdateEmail
};
