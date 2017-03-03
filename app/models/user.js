var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
  username: String,
  password: String,
  timestamps: {type: Date, default: Date.now}
});

usersSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      this.set('password', hash);
    })
    .then(function() {
      next();
    });
});

var User = mongoose.model('User', usersSchema);

module.exports = User;