var defaults = {
	somafmPollInterval: 10000,
	logLevel: 'info',
	lastfmApiKey: null,
	address: '0.0.0.0',
	port: 9987,
	enableCors: true,,
	uri: 'http://localhost:9987'
};

module.exports = require('rc')('somascrobblerapi', defaults);
