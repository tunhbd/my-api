const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { JWT } = require('../config');
const { hashPassword } = require('../utils/password');
const { userModel } = require('../database');

const usingLocalStrategy = () => {
  passport.use(new LocalStrategy(
    function (username, password, done) {
      userModel
        .findOne({ username, password: hashPassword(password) })
        .then(res => {
          console.log('res', res);
          if (res.err) {
            return done(res.err);
          }
          if (res.data) {
            return done(null, {
              ...Object.assign({}, res.data),
              password: undefined,
              birthday: undefined,
              firstName: undefined,
              lastName: undefined
            });
          }

          return done(null, null);
        })
        .catch(err => {
          return done(err);
        });
    }
  ));
}

const usingJwtStrategy = () => {
  const opts = {
    secretOrKey: JWT.SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  };

  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    userModel
      .findOne({ username: jwt_payload.username })
      .then(res => {
        if (res.err) {
          return done(err, false);
        }

        if (res.data) {
          return done(null, {
            ...res.data,
            password: undefined
          });
        }

        return done(null, false);
      });
  }));
}

module.exports = app => {
  // app.use(expressSession({ secret: 'NguyenHuuTu-1612772', resave: true, saveUninitialized: true }));
  app.use(passport.initialize());
  // app.use(passport.session());

  usingLocalStrategy();
  usingJwtStrategy();
}

