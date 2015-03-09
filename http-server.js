var config = require('./config');
var log = require('bole')('http-server');
var hapi = require('hapi');

var server = new hapi.Server();

server.connection({
	address: config.address,
	port: config.port,
	uri: config.uri
});

server.route([

	{
		path: '/{path*}',
		method: 'GET',
		handler: {
			directory: {
				path: './static',
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

server.start(function () {
	log.info('server running at', server.info.uri)
});

module.exports = server;
