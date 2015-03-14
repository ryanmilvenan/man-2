var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

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
});

app.post('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    var comments = JSON.parse(data);
    comments.push(req.body);
    fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(comments));
    });
  });
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');
