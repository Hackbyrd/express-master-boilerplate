/**
 * ADMIN ROUTES
 */

'use strict';

// require controller
const controller = require('./controller');

// require middleware
const { JWTAuth, verifyJWTAuth } = require('../../middleware/auth');

module.exports = (passport, router) => {
  // routes
  router.all('/v1/admins/login', controller.V1Login);
  router.all('/v1/admins/resetpassword', controller.V1ResetPassword);
  router.all('/v1/admins/confirmpassword', controller.V1ConfirmPassword);

  router.all('/v1/admins/read', JWTAuth, verifyJWTAuth, controller.V1Read);
  router.all('/v1/admins/create', JWTAuth, verifyJWTAuth, controller.V1Create);
  router.all('/v1/admins/update', JWTAuth, verifyJWTAuth, controller.V1Update);
  router.all('/v1/admins/query', JWTAuth, verifyJWTAuth, controller.V1Query);
  router.all('/v1/admins/updatepassword', JWTAuth, verifyJWTAuth, controller.V1UpdatePassword);
  router.all('/v1/admins/updateemail', JWTAuth, verifyJWTAuth, controller.V1UpdateEmail);

  // return router
  return router;
};
