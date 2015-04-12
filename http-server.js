var config = require('./config');
var url = require('url');
var log = require('bole')('http-server');
var path = require('path');
var hapi = require('hapi');
var tv = require('tv');

var server = new hapi.Server();

server.connection({
	host: url.parse(config.uri).hostname,
	address: config.address,
	port: config.port,
	uri: config.uri,
	routes: { cors: config.enableCors }
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
			host: url.parse(config.uri).hostname,
			endpoint: config.debugEndpoint
		}
	}

], function (err) {
	server.start(function () {
		log.info('server running at', server.info.uri)
	});
});

module.exports = server;
