var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var socket = require('./lib/io.js');
var db = require('./lib/db.js');
var routes = require('./lib/routes.js');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var uuid = require('node-uuid');
var app = express();

app.use(session({
    genid: function(req) {
        return uuid.v4();
    },
    secret: "Keyboard cat",
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {maxAge: (60000 * 10)},
    store: new MongoStore({mongooseConnection: db.mongoose.connection}) 
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;
app.get("/", routes.index);
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io')(server);
io.on('connection', socket);

module.exports = {
    app: app,
    server: server,
    io: io,
};



