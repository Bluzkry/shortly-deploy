var request = require('request');
var crypto = require('crypto');
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
  Link.find({}, function(err, foundData) {
    if (err) {
      console.error(err)
      res.status(500).send();
    } else {
      res.status(200).send(foundData);
    }
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url.toString();

  if (!util.isValidUrl(uri)) {
    return res.sendStatus(404);
  }

  var linkQuery = {};
  var url = 'url';
  linkQuery[url] = uri;
  Link.find(linkQuery, function(err, foundData) {
    if (err) {
      console.err(error);
      res.status(500).send();
    } else {
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
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ username: username }, function(err, foundUser) {
    if(err) {
      console.error(err);
      res.status(500).send();
    }
    console.log(foundUser)
    if(!foundUser) {
      res.redirect('/login');
    } else {
      util.comparePassword(foundUser, password, function(match) {
        if (match) {
          util.createSession(req, res, foundUser);
        } else {
          res.redirect('/login');
        }
      })
    }
  })
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({username:username}, function(err, foundUser){
    if(err) {
      console.error(err);
      res.status(500).send()
    };
    if (foundUser.length === 0) {
      var newUser = new User({
        username: username,
        password: password
      })
      newUser.save(function(err, savedUser) {
        if (err) {
          console.error(err);
          res.status(404).send();
        } else {
          util.createSession(req, res, newUser)
        }
      });
    } else {
        res.redirect('/signup');
    }
  })
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}, function(err, foundData) {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      if (!foundData) {
        res.redirect('/');
      } else {

        foundData.visits++;
        foundData.save(function(err, updatedData) {
          if (err) {
            console.error(err);
            response.status(500).send();
          } else {
            res.redirect(updatedData.url);            
          }
        });

      }
    }
  });
};