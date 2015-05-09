var express = require('express');
var router = express.Router();

var sessions = {};

router.get('/', function(req, res, next) {
    var sess = req.session;
    sessions[req.sessionID] = sess;
    next();
});

module.exports.index = router;
module.exports.sessions = sessions;
