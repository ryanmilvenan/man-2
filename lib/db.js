var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var uuid = require('node-uuid');

mongoose.connect('mongodb://localhost/news')
var db = mongoose.connection;

var newsSourceSchema = mongoose.Schema({
    title: String,
    url: String,
    username: String,
    sourceID: String,
    x: Number,
    y: Number,
    w: Number,
    h: Number
});

var NewsSource = mongoose.model('source', newsSourceSchema);

var sessionSchema = mongoose.Schema({
    session: String
});

var Session = mongoose.model('sessions', sessionSchema);

var tabSchema = mongoose.Schema({
    title: String,
    tabID: String,
    sources: [newsSourceSchema]
})

var Tab = mongoose.model('tabs', tabSchema);

var userSchema = mongoose.Schema({
    username: { type: String, required: true, index: {unique: true} },
    password: { type: String, required: true },
    tabs: [tabSchema]
});

userSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);  
    });
};

var User = mongoose.model('users', userSchema);

User.find({}, function(err, docs) {
    if(docs.length == 0) {
        var tabID = uuid.v4();
        var newTab = new Tab({title: "Home", tabID: tabID});
        var newDefault = new User({username: "default", password: "admin"});
        newDefault.tabs.push(newTab);
        newDefault.save(function(err) {
            console.log("Initializing Default User...");
            if(err) return console.error(err);
        });
    };
});

module.exports = {
    mongoose: mongoose,
    NewsSource: NewsSource,
    Tab: Tab,
    Session: Session,
    User: User
};
