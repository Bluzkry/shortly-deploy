var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// url

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

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

// var Link = new urls({
// })

module.exports = Link;