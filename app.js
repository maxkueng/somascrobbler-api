var debug = require('debug')('somastream');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var SomaStationStream = require('somastation');
var AutocorrectStream = require('lastfm-autocorrect');
var through =  require('through');
var socketio = require('socket.io');
var stations = require('./stations.json');
var server = require('http').createServer(serverHandler);
var io = socketio.listen(server);
var noop = function () {};

var config = {};
var connectionCount = 0;
var stationLastTrack = {};

try {
	config = require('./config.json');
	debug('config', 'loaded ./config.json');
} catch (e) {
	debug('config', 'no config file');
}

config.port = config.port || process.env.PORT;
config.lastfmApiKey = config.lastfmApiKey|| process.env.LASTFM_API_KEY;
config.proxy = config.proxy || {};
config.proxy.protocol = config.proxy.protocol || process.env.PROXY_PROTOCOL || 'http';
config.proxy.domain = config.proxy.domain || process.env.PROXY_DOMAIN;
config.proxy.port = config.proxy.port || process.env.PROXY_PORT;

function serverHandler (req, res) {
	fs.readFile(path.join(__dirname, 'documentation.html'), 'utf8', function (err, content) {
		if (err) {
			return res.writeHead(500), res.end('Internal server error');
		}

		var proxyURL = config.proxy.protocol + '://'
		             + config.proxy.domain
		             + ':' + config.proxy.port;

		var html = _.template(content, {
			stations: stations,
			proxy: config.proxy,
			proxyURL: proxyURL,
			connectedClients: connectionCount,
			stationLastTrack: stationLastTrack
		});

		res.writeHead(200);
		res.end(html);
	});
}

function autocorrect () {
	return new AutocorrectStream(config.lastfmApiKey);
}

function print () {
	return through(function (track) {
		debug(track.stationId, track.artist, '-', track.title);
	});
}

function sendInfo () {
	io.sockets.in('info').emit('info', {
		connectedClients: connectionCount,
		stationLastTrack: stationLastTrack
	});
}

server.listen(config.port || process.env.PORT || 9999);

io.set('log level', 2);

io.on('connection', function (socket) {
	connectionCount += 1;
	io.sockets.in('info').emit('info', { connectedClients: connectionCount });

	socket.on('subscribe', function (stationId, ack) {
		if (typeof ack !== 'function') { ack = noop; }

		if (stationId === 'meta:info') {
			return socket.join('info');
		}

		if (!stations[stationId]) {
			return ack({ error: "No such station '" + stationId + "'" });
		}

		socket.join(stationId);
		ack({ subscribed: stationId });
	});

	socket.on('unsubscribe', function (stationId, ack) {
		if (typeof ack !== 'function') { ack = noop; }

		if (!stations[stationId]) {
			return ack({ error: "No such station '" + stationId + "'" });
		}

		socket.leave(stationId);
		ack({ unsubscribed: stationId });
	});

	socket.on('disconnect', function () {
		connectionCount -= 1;
		sendInfo();
	});
});

Object.keys(stations).forEach(function (stationId) {
	var somaStream = new SomaStationStream(stationId);
	somaStream.on('error', function (err) {
		debug('error', err);
	});

	somaStream
		.pipe(autocorrect())
		.pipe(through(function (track) {
			track.stationId = stationId;

			stationLastTrack[stationId] = +moment.utc();
			io.sockets.in(stationId).emit('track', track);
			sendInfo();
			this.queue(track);
		}))
		.pipe(print());
});
