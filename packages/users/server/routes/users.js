'use strict';

// User routes use users controller
var users = require('../controllers/users'),
    config = require('meanio').loadConfig();

module.exports = function(MeanUser, app, auth, database, passport) {

  app.route('/logout')
    .get(users.signout);
  app.route('/users/me')
    .get(users.me);

  // Setting up the users api
  app.route('/register')
    .post(users.create);

  app.route('/forgot-password')
    .post(users.forgotpassword);

  app.route('/reset/:token')
    .post(users.resetpassword);

  // Setting up the userId param
  app.param('userId', users.user);

  // AngularJS route to check for authentication
  app.route('/loggedin')
    .get(function(req, res) {
      res.send(req.isAuthenticated() ? req.user : '0');
    });

  // Setting the local strategy route
  app.route('/login')
    .post(passport.authenticate('local', {
      failureFlash: true
    }), function(req, res) {
      res.send({
        user: req.user,
        redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
      });
    });

  // AngularJS route to get config of social buttons
  app.route('/get-config')
    .post(function (req, res) {
      req.session.attemptedUrl = req.body.attemptedUrl;
      config.loginerror = req.session.loginerror;
      req.session.loginerror = '';
      res.send(config);
    });

  // Setting the facebook oauth routes
  app.route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope: ['email', 'user_about_me'],
      failureRedirect: '/#!/auth/login'
    }), users.signin);

  /*app.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      failureRedirect: '/#!/auth/login',
      failureFlash: true
    }), users.authCallback);*/  

  app.route('/auth/facebook/callback')
    .get(function(req, res, next) {
      passport.authenticate('facebook', function(err, user, info) {
        if (!user) {
          if (err.message) req.session.loginerror = err.message;
          if (err.errors) {
            if (err.errors.email) {
              if (err.errors.email.message) {
                req.session.loginerror = err.errors.email.message;
              }
            }
          }
        
          return res.redirect('/#!/auth/login'); 
        }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })(req, res, next);
  });   
    
  // Setting the github oauth routes
  app.route('/auth/github')
    .get(passport.authenticate('github', {
      failureRedirect: '/#!/auth/login'
    }), users.signin);

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      failureRedirect: '/#!/auth/login'
    }), users.authCallback);

  // Setting the twitter oauth routes
  app.route('/auth/twitter')
    .get(passport.authenticate('twitter', {
      failureRedirect: '/#!/auth/login'
    }), users.signin);

  /*app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      failureRedirect: '/#!/auth/login'
    }), users.authCallback);*/

  app.route('/auth/twitter/callback')
    .get(function(req, res, next) {
      passport.authenticate('twitter', function(err, user, info) {
        if (!user) {
          if (err.message) req.session.loginerror = err.message;
          if (err.errors) {
            if (err.errors.email) {
              if (err.errors.email.message) {
                req.session.loginerror = err.errors.email.message;
              }
            }
          }
        
          return res.redirect('/#!/auth/login'); 
        }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })(req, res, next);
  });    

  // Setting the google oauth routes
  app.route('/auth/google')
    .get(passport.authenticate('google', {
      failureRedirect: '/#!/auth/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);

  app.route('/auth/google/callback')
    .get(passport.authenticate('google', {
      failureRedirect: '/#!/auth/login'
    }), users.authCallback);

  // Setting the linkedin oauth routes
  app.route('/auth/linkedin')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '/#!/auth/login',
      scope: ['r_emailaddress']
    }), users.signin);

  app.route('/auth/linkedin/callback')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '/#!/auth/login'
    }), users.authCallback);

};
