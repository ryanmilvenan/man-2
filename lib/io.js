var db = require('./db.js');
var FeedParser = require('feedparser');
var request = require('request'); var uuid = require('node-uuid');

module.exports = function(socket) {
    
    socket.on('sources:retrieve', function() {
        var sources = db.get('sources');
        sources.find({}, function(err, docs) {
            socket.emit('sources:found', docs);
            docs.forEach(function(doc) {
                getStream(doc.url, doc.sourceID) 
            })
        });
    });
    socket.on('sources:new', function(data) {
        var sources = db.get('sources');
        var url = data.url;
        var title = data.title;
        var sourceID = uuid.v1();
        sources.insert({ url: url, title: title, sourceID: sourceID}, function(err, doc) {
           if (err) throw err; 
        });
        socket.emit('update:sources');
    });
    socket.on('connection', function(socket, id) {
        console.log('a user connection');
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });

    var getStream = function(url, sourceID) {
                    
        var req = request(url),
            feedparser = new FeedParser();

        req.on('error', function(error) {

        });
        req.on('response', function(res) {
            var stream = this;

            if(res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

            stream.pipe(feedparser);
        });

        feedparser.on('error', function(error) {

        });

        feedparser.on('readable', function() {
            var stream = this,
            meta = this.meta,
            item;

            while (item = stream.read()) {
                socket.emit('stream:item', {data:item, sourceID: sourceID});
            }
        });
    };
};

