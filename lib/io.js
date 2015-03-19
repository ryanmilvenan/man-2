var db = require('./db.js');
var FeedParser = require('feedparser');
var request = require('request'); 
var uuid = require('node-uuid');


module.exports = function(socket) {
    
    socket.on('sources:retrieve', function() {
        db.NewsSource.find(function(err, docs) {
            socket.emit('sources:found', docs);
            docs.forEach(function(doc) {
                getStream(doc.url, doc.sourceID) 
            })
        })
    });

    socket.on('sources:remove', function(sourceID) {
        var sourceID = sourceID.sourceID;
        db.NewsSource.remove({sourceID: sourceID}, function(err, doc) {
            if(err) return console.error(err);
        });
        socket.emit('update:sources')
    })

    socket.on('sources:new', function(data) {
        var url = data.url;
        var title = data.title;
        var verified = verifySource(url);
        if(verified) {
            var sourceID = uuid.v4();
            var NewsSource = db.NewsSource;
            var newSource = new NewsSource({url: url, title: title, sourceID: sourceID});
            newSource.save(function(err, doc) {
                if(err) return console.error(err);
                console.log("New Source: " + doc)
            })
            socket.emit('update:sources')
        }
    });

    socket.on('connection', function(socket, id) {
        console.log('a user connection');
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });

    var verifySource = function(url) {
        var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        if (url.match(regex)) {
            //var req = request(url);
            //req.on('error', function(error) {
            //    socket.emit('source:invalid', {error: error});
            //    return false;
            //});
            //req.on('response', function(res) {
            //});
            return true;
        } else {
            socket.emit('source:invalid', {error: "Improperly formatted URL"});
            return false;
        } 
    }

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

