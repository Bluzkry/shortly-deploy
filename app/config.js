var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/linkify');
var db = mongoose.connection;

module.exports = db;