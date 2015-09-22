var bunyan = require('bunyan');

var stream = [
	{
		stream:process.stdout
	},
	{
                level: 'error',
		path:__dirname + '/full.log'
	}
];

module.exports = stream;
