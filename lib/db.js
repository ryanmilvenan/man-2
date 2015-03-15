var monk = require('monk');
var db = monk('localhost:27017/news');


module.exports = db;
