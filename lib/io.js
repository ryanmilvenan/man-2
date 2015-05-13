var fs = require('fs');
var db = require('./db.js');
var server = require('../server.js');
var cookieParser = require('cookie-parser');
var FeedParser = require('feedparser');
var request = require('request'); 
var uuid = require('node-uuid');
var sessions = require('./routes.js').sessions;


module.exports = function(socket) {
    var handshakeData = socket.handshake; 
    if(handshakeData) {
        var sid = handshakeData.headers.cookie.replace(/.*connect.sid=(.*)?.*/, '$1');
        handshakeData.sessionID = sid.split('.')[0].substring(4); 
    }
    var session = sessions[handshakeData.sessionID];
    if(session && session.loggedIn) {
        socket.emit('server:log-in', {username: session.user});
    }

    socket.on('disconnect', function() {
        var handshakeData = socket.handshake; 
        var sid = handshakeData.headers.cookie.replace(/.*connect.sid=(.*)?.*/, '$1');
        handshakeData.sessionID = sid.split('.')[0].substring(4); 
        var session = sessions[handshakeData.sessionID];
        
        //db.Session.findOne(handshakeData.sessionID, function(err, doc) {
        //    if(err) return console.error(err);
        //    if(!doc) {
        //        session.destroy(function(err) {
        //            if(err) return console.error(err);
        //        })
        //    }
        //});
    });
    
    socket.on('sources:retrieve', function(data) {
        var handshakeData = socket.handshake; 
        var sid = handshakeData.headers.cookie.replace(/.*connect.sid=(.*)?.*/, '$1');
        handshakeData.sessionID = sid.split('.')[0].substring(4); 
        db.Session.findOne(handshakeData.sessionID, function(err, sessDoc) {
            if(err) console.error(err);
            if(sessDoc) {
                var jsonSession = JSON.parse(sessDoc.session);
                var sessUser = jsonSession.user;
                if(sessUser) {
                    db.User.findOne({username:sessUser}, function(err, doc) {
                        if(err) return console.error(err);
                        console.log(doc);
                      socket.emit('server:tabs', {tabs: doc.tabs});
                    });
                } else {
                    db.User.findOne('default', function(err, doc) {
                      socket.emit('server:tabs', {tabs: doc.tabs});
                    });
                }
            } else {
                db.User.findOne('default', function(err, doc) {
                  socket.emit('server:tabs', {tabs: doc.tabs});
                });
            }
        });
    });

    socket.on('sources:populate', function(data) {
        socket.emit('sources:tab', data.tab);
        socket.emit('sources:found', data.tab.sources);
        data.tab.sources.forEach(function(source) {
            getStream(source.url, source.sourceID);
        });
    });

    socket.on('sources:import', function(file) {
        var tab = JSON.parse(file.data);
        var user = file.user;

        db.User.findOne({username:user}, function(err, doc) {
            if(err) return console.error(err);
            
            var Tab = db.Tab;
            var NewsSource = db.NewsSource;
            var tabID = uuid.v4();
            var newTab = new Tab({title: tab.title, tabID: tabID});
        
            tab.sources.forEach(function(source) {
                var sourceID = uuid.v4();
                var title = source.title;
                var url = source.url;
                var user = source.username;
                var newSource = new NewsSource({url: url, title: title, username:user, sourceID: sourceID});
                newTab.sources.push(newSource);
            });
            
            doc.tabs.push(newTab);

            doc.save(function(err) {
                if(err) return console.error(err);
                socket.emit('update:sources');
            });
        });

    });

    socket.on('sources:rename', function(source) {
        var title = source.title;
        var sourceID = source.sourceID;
        db.User.findOne({"tabs.sources.sourceID":sourceID}, function(err, doc) {
            if(err) return console.error(err);
            var tabIdx, sourceIdx;
            for(var i = 0; i < doc.tabs.length; i++) {
                for(var j = 0; j < doc.tabs[i].sources.length; j++) {
                    if(sourceID == doc.tabs[i].sources[j].sourceID) {
                        tabIdx = i;
                        sourceIdx = j;
                        break;
                    }
                }
                if(tabIdx) break;
            }
            doc.tabs[tabIdx].sources[sourceIdx].title = title;
            doc.save(function(err) {
                if(err) return console.error(err);
                socket.emit('update:sources');
            });
        });
    });

    socket.on('sources:updatePosition', function(source) {
        var x = source.x;
        var y = source.y;
        var sourceID = source.sourceID;
        db.User.findOne({"tabs.sources.sourceID":sourceID}, function(err, doc) {
            if(err) return console.error(err);
            var tabIdx, sourceIdx;
            for(var i = 0; i < doc.tabs.length; i++) {
                for(var j = 0; j < doc.tabs[i].sources.length; j++) {
                    if(sourceID == doc.tabs[i].sources[j].sourceID) {
                        tabIdx = i;
                        sourceIdx = j;
                        break;
                    }
                }
                if(tabIdx) break;
            }
            doc.tabs[tabIdx].sources[sourceIdx].x = x;
            doc.tabs[tabIdx].sources[sourceIdx].y = y;
            doc.save(function(err) {
                if(err) return console.error(err);
                socket.emit('update:sources');
            });
        });
    });

    socket.on('sources:remove', function(data) {
        var sourceID = data.sourceID;
        db.User.findOne({"tabs.sources.sourceID":sourceID}, function(err, doc) {
            if(err) return console.error(err);
            var tabIdx, sourceIdx;
            for(var i = 0; i < doc.tabs.length; i++) {
                for(var j = 0; j < doc.tabs[i].sources.length; j++) {
                    if(sourceID == doc.tabs[i].sources[j].sourceID) {
                        tabIdx = i;
                        sourceIdx = j;
                        break;
                    }
                }
                if(tabIdx) break;
            }
            doc.tabs[tabIdx].sources[sourceIdx].remove();
            doc.save(function(err) {
                if(err) return console.error(err);
                socket.emit('update:sources');
            });
        });
    });

    socket.on('sources:new', function(data) {
        var url = data.url;
        var title = data.title;
        var user = data.username;
        var tab = data.tab;
        var x = data.x;
        var y = data.y;
        var w = data.w;
        var h = data.h;
        var verified = verifySource(url);
        console.log(h);
        if(verified) {
            var sourceID = uuid.v4();
            var NewsSource = db.NewsSource;
            db.User.findOne({username: user}, function(err, userDoc) {
                if(err) return console.error(err);
                var tabIdx;
                for(var i = 0; i < userDoc.tabs.length; i++) {
                    if(tab.tabID == userDoc.tabs[i].tabID) {
                        tabIdx = i;
                    }
                    if(tabIdx) break;
                }
                var newSource = new NewsSource({url: url, title: title, username:user, sourceID: sourceID, x:x, y:y, h:h, w:w});
                userDoc.tabs[tabIdx].sources.push(newSource);
                userDoc.save(function(err, doc) {
                    if(err) return console.error(err);
                    socket.emit('addsource:success');
                });
            });
            socket.emit('update:sources');
        }
    });

    socket.on('tab:new', function(data) {
        var title = data.title;
        var user = data.user;
        var tabID = uuid.v4();

        var Tab = db.Tab;
        var newTab = new Tab({title:title, tabID:tabID});
        db.User.findOne({username:user}, function(err, doc) {
            if(err) return console.error(err);
            doc.tabs.push(newTab);
            doc.save(function(err) {
                if(err) return console.error(err);
                socket.emit('update:sources');
            });
        });
    });

    socket.on('client:log-in', function(data) {
        var user = data.email;
        var password = data.password;

        db.User.findOne({username: user}, function(err, doc) {
            if(doc && doc.username == user) {
                if (err) return console.error(err);
                doc.comparePassword(password, function(err, isMatch) {
                    if (err) return console.err(err);
                    if(isMatch) {
                        var handshakeData = socket.handshake; 
                        var sid = handshakeData.headers.cookie.replace(/.*connect.sid=(.*)?.*/, '$1');
                        handshakeData.sessionID = sid.split('.')[0].substring(4); 
                        var session = sessions[handshakeData.sessionID];
                        if(session) {
                            session.loggedIn = true;
                            session.user = user;
                            session.save(function(err) {
                                if(err) return console.err(err);
                                db.Session.findOne(handshakeData.sessionID, function(err, doc) {
                                    if(err) console.error(err);
                                    if(doc) {
                                        var jsonSession = JSON.parse(doc.session);
                                        var sessUser = jsonSession.user;
                                        socket.emit('server:log-in', {username: sessUser});
                                        socket.emit('update:sources');
                                    }
                                });
                            });
                        }
                    } else {
                        socket.emit('server:invalid-password');
                    }
                });

            } else {
                socket.emit('server:invalid-password');
            }
        }); 
    });

    socket.on('client:log-out', function(data) {
        var handshakeData = socket.handshake; 
        var sid = handshakeData.headers.cookie.replace(/.*connect.sid=(.*)?.*/, '$1');
        handshakeData.sessionID = sid.split('.')[0].substring(4); 
        var session = sessions[handshakeData.sessionID];
        if(session) {
            session.loggedIn = false; 
            session.destroy(function(err) {
                if(err) return console.error(err);
            })
        }
        socket.emit('update:sources');
    });

    socket.on('client:create-user', function(data) {
        var user = data.email;
        var password = data.password;

        db.User.findOne({username: user}, function(err, doc) {
            if(err) console.error(err);
            if(doc && doc.username == user) {
                socket.emit('server:user-exists');
            } else {
                db.User.findOne({username: "default"}, function(err, doc) {
                    var User = db.User;
                    var Tab = db.Tab; 
                    var NewsSource = db.NewsSource;
                    var defaultSources = doc.tabs[0].sources; 
                    var tabID = uuid.v4();
                    var newTab = new Tab({title: "Home", tabID:tabID});
                    defaultSources.forEach(function(source) {
                        var sourceID = uuid.v4();
                        var title = source.title;
                        var url = source.url;
                        var user = source.username;
                        var w = source.w;
                        var h = source.h;
                        var x = source.x;
                        var y = source.y;
                        var newSource = new NewsSource({url: url, title: title, username:user, sourceID: sourceID, x:x, y:y, w:w, h:h});
                        newTab.sources.push(newSource);
                    });
                    var newUser = new User({username: user, password: password});
                    newUser.tabs.push(newTab);
                    newUser.save(function(err) {
                        if(err) return console.error(err);
                    });
                    socket.emit('server:log-in', {username: user});
                    socket.emit('update:sources')
                });
            }
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
    };

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

