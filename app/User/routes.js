/**
 * USER ROUTES
 */

'use strict';

// require controller
const controller = require('./controller');

// require middleware
const { JWTAuth, verifyJWTAuth } = require('../../middleware/auth');

module.exports = (passport, router)  => {

  // routes
  // router.all('/FEATURE/METHOD1', controller.V1Method1);
  // router.all('/FEATURE/METHOD2', JWTAuth, verifyJWTAuth, controller.V1Method2);

  // return router
  return router;
}
