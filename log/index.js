var Bunyan = require('bunyan');
var streams = require('./streams');
var log = Bunyan.createLogger({
  name:'man-2',
  streams:streams
});

module.exports = log;
