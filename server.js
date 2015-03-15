var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./lib/db.js');
var socket = require('./lib/io.js')
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io')(server);
io.on('connection', socket)

app.get('/sources', function(req, res) {
    var sources = db.get('sources');
    sources.find({}, function (err, docs) {
        res.send(docs);
    });
});

app.post('/sources', function(req, res) {
    var sources = db.get('sources');
    var url = req.body.url;
    var title = req.body.title;
    sources.insert({ url: url, title: title}, function(err, doc) {
       if (err) throw err; 
    });
    io.emit('update:sources');
});

module.exports = {
    app: app,
    server: server,
    io: io
}



