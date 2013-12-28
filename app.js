var debug = require('debug')('somastream'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	SomaStationStream = require('somastation'),
	AutocorrectStream = require('lastfm-autocorrect');
	through =  require('through'),
	socketio = require('socket.io'),
	config = require('./config.json'),
	stations = require('./stations.json'),
	server = require('http').createServer(serverHandler),
	io = socketio.listen(server);
	lastfmApiKey = config.lastfmApiKey || process.env.LASTFM_API_KEY,
	noop = function () {};

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
			proxyURL: proxyURL
		});

		res.writeHead(200);
		res.end(html);
	});
}

function autocorrect () {
	return new AutocorrectStream(lastfmApiKey);
}

function print () {
	return through(function (track) {
		debug(track.stationId, track.artist, '-', track.title);
	});
}

server.listen(config.port || process.env.PORT || 9999);

io.set('log level', 2);

io.on('connection', function (socket) {
	socket.on('subscribe', function (stationId, ack) {
		if (typeof ack !== 'function') { ack = noop; }

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

			io.sockets.in(stationId).emit('track', track);
			this.queue(track);
		}))
		.pipe(print());
});
