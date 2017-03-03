var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  timestamps: {type: Date, default: Date.now}
});

urlSchema.pre('save', function(next) {
  var user = this;
  var shasum = crypto.createHash('sha1');
  shasum.update(user.url);
  user.code = shasum.digest('hex').slice(0, 5);
  next();
});


var Link = mongoose.model('Link', urlSchema);

module.exports = Link;