/**
 * passport.js configuration
 */

'use strict';

// require third-party node modules
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// require custom node modules
const models = require('../models');

// extract env variables
const { SESSION_SECRET } = process.env;

// set up passport
module.exports = async passport => {
  /**********************************************/
  /******************** USER ********************/
  /**********************************************/

  /**
   * Use local login to authenticate
   *
   * @email (STRING): Email of user
   * @password (STRING): password of user
   */
  passport.use(
    'JWTUserLogin',
    new LocalStrategy(
      {
        usernameField: 'email', // change username field to email instead of username
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        email = email.toLowerCase().trim(); // lowercase email

        process.nextTick(async () => {
          try {
            const getUser = await models.user.findOne({
              where: {
                email: email
              }
            });

            // check if user email is not found
            if (!getUser) return done(null, false);

            // check password
            models.user.validatePassword(password, getUser.password, async (err, result) => {
              if (err) return done(err, null);

              // if password is invalid
              if (!result) return done(null, null);

              // if password is valid, return user
              return done(null, getUser);
            });
          } catch (err) {
            return done(err, null);
          }
        });
      }
    )
  );

  /**
   * Use JSON WEB TOKEN via our api to authenticate users for each request
   *
   * @payload (OBJECT): token object that contains { sub: user.id, iat: timestamp }
   *
   * curl -v -H "Authorization: jwt-user eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNDc3MTM0NzM4fQ.Ky3iKYcguIstYPDbMbIbDR5s7e_UF0PI1gal6VX5eyI"
   */
  passport.use(
    'JWTAuthUser',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt-user'), // must be from auth header for HTTPS to work, should NOT use fromHeader because it is only applied to http
        secretOrKey: SESSION_SECRET
      },
      async (payload, done) => {
        process.nextTick(async () => {
          try {
            // check if user id is not found
            const findUser = await models.user.findOne({
              where: {
                id: payload.sub // subject or id of user
              }
            });

            return done(null, findUser ? findUser : false);
          } catch (err) {
            return done(err, null);
          }
        });
      }
    )
  );

  /***********************************************/
  /******************** ADMIN ********************/
  /***********************************************/

  /**
   * Use local login to authenticate
   *
   * @email (STRING): Email of admin
   * @password (STRING): password of admin
   */
  passport.use(
    'JWTAdminLogin',
    new LocalStrategy(
      {
        usernameField: 'email', // change username field to email instead of username
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        email = email.toLowerCase().trim(); // lowercase email

        process.nextTick(async () => {
          try {
            const getAdmin = await models.admin.findOne({
              where: {
                email: email
              }
            });

            // check if admin email is not found
            if (!getAdmin) return done(null, false);

            // check password
            models.admin.validatePassword(password, getAdmin.password, async (err, result) => {
              if (err) return done(err, null);

              // if password is invalid
              if (!result) return done(null, null);

              // if password is valid, return admin
              return done(null, getAdmin);
            });
          } catch (err) {
            return done(err, null);
          }
        });
      }
    )
  );

  /**
   * Use JSON WEB TOKEN via our api to authenticate admins for each request
   *
   * @payload (OBJECT): token object that contains { sub: admin.id, iat: timestamp }
   *
   * curl -v -H "Authorization: jwt-admin eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNDc3MTM0NzM4fQ.Ky3iKYcguIstYPDbMbIbDR5s7e_UF0PI1gal6VX5eyI"
   */
  passport.use(
    'JWTAuthAdmin',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt-admin'), // must be from auth header for HTTPS to work, should NOT use fromHeader because it is only applied to http
        secretOrKey: SESSION_SECRET
      },
      async (payload, done) => {
        process.nextTick(async () => {
          try {
            // check if admin id is not found
            const findAdmin = await models.admin.findOne({
              where: {
                id: payload.sub // subject or id of admin
              }
            });

            return done(null, findAdmin ? findAdmin : false);
          } catch (err) {
            return done(err, null);
          }
        });
      }
    )
  );
};
