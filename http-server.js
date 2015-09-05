var config = require('./config');
var url = require('url');
var log = require('bole')('http-server');
var path = require('path');
var hapi = require('hapi');
var tv = require('tv');

var server = new hapi.Server();

server.connection({
	address: config.get('server.address'),
	port: parseInt(config.get('server.port'), 10),
	uri: config.get('server.uri'),
	routes: { cors: config.get('server.cors') }
});

server.route([

	{
		path: '/{path*}',
		method: 'GET',
		handler: {
			directory: {
				path: path.resolve(__dirname, './static'),
				listing: false,
				index: true
			}
		}
	},

	{
		path: '/api/v1/stations',
		method: 'GET',
		handler: require('./api/get-stations.js')
	},

	{
		path: '/api/v1/version',
		method: 'GET',
		handler: require('./api/get-version.js')
	},

	{
		path: '/api/v1/stats',
		method: 'GET',
		handler: require('./api/get-stats.js')
	},

	{
		path: '/api/v1/nowplaying/{stationId}',
		method: 'GET',
		handler: require('./api/get-nowplaying.js')
	},

]);

server.register([
	{
		register: tv,
		options: {
			host: url.parse(config.get('server.uri')).hostname,
			endpoint: config.get('tv.debugendpoint')
		}
	}

], function (err) {
	server.start(function () {
		log.info('server running at', server.info.uri)
	});
});

module.exports = server;
