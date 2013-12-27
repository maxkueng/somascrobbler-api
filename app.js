var debug = require('debug')('somastream'),
	SomaStationStream = require('somastation'),
	AutocorrectStream = require('lastfm-autocorrect');
	through =  require('through'),
	socketio = require('socket.io'),
	config = require('./config.json'),
	stations = require('./stations.json'),
	io = socketio.listen(config.port || process.env.PORT || 9999);
	lastfmApiKey = config.lastfmApiKey || process.env.LASTFM_API_KEY,
	noop = function () {};

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

function autocorrect () {
	return new AutocorrectStream(lastfmApiKey);
}

function print () {
	return through(function (track) {
		debug(track.stationId, track.artist, '-', track.title);
	});
}

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
