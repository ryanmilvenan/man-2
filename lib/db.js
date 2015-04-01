var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/news')
var db = mongoose.connection;

var newsSourceSchema = mongoose.Schema({
    title: String,
    url: String,
    sourceID: String
});

var NewsSource = mongoose.model('source', newsSourceSchema)

module.exports = {
    mongoose: mongoose,
    NewsSource: NewsSource
}
