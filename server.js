var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var socket = require('./lib/io.js');
var db = require('./lib/db.js');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    genid: function(req) {
        return genuuid();
    },
    secret: "Keyboard cat",
    proxy: true,
    cookie: {maxAge: 60000},
    store: new MongoStore({mongooseConnection: db.mongoose.connection})
}));

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io')(server);
io.on('connection', socket);

module.exports = {
    app: app,
    server: server,
    io: io
};



