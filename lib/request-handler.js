var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).exec()
    .then(function(foundData) {
      res.status(200).send(foundData);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send();
    });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url.toString();

  if (!util.isValidUrl(uri)) {
    return res.sendStatus(404);
  }

  Link.find({url: uri}).exec()
    .then(function(foundData) {
      if (foundData.length > 0) {
        res.status(200).send(foundData[0]);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          var newLink = new Link();
          newLink.url = uri;
          newLink.baseUrl = req.headers.origin;
          newLink.title = title;
          newLink.visits = 0;
          newLink.save(function(err, savedLink) {
            if (err) {
              console.error(err);
              res.status(404).send();
            } else {
              res.status(200).send(savedLink);
            }
          });
        });
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send();
    });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username: username}).exec()
    .then(function(foundUser) {
      if (!foundUser) {
        res.redirect('/login');
      } else {
        util.comparePassword(foundUser, password)
          .then(function(match) {
            if (match) {
              util.createSession(req, res, foundUser);
            } else {
              res.redirect('/login');
            }
          })
          .catch(function(err) {
            console.error(err);
            })
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send();
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({username:username}).exec()
    .then(function(foundUser){
      if (foundUser.length === 0) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save()
          .then(function(savedUser) {
            util.createSession(req, res, newUser);
          })
          .catch(function(err) {
            console.error(err);
            res.status(404).send();
          });
      } else {
        res.redirect('/signup');
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send()
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}).exec()
    .then(function(foundData) {
      if (!foundData) {
        res.redirect('/');
      } else {
        foundData.visits++;
        foundData.save()
          .then(function(updatedData) {
            res.redirect(updatedData.url);
          })
          .catch(function(err) {
            console.error(err);
            response.status(500).send();
          });
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send();
    });
};