var log = require('bole')('socketio-api');
var socketio = require('socket.io');
var stats = require('./stats');

function noop () {}

exports = module.exports = function (server, options) {
	var stations = options.stations || {};
	var io = socketio(server);

	var api = {

		getSocketAddress: function (socket) {
			return socket.handshake.address;
		},

		sendStats: function () {
			io.to('meta:stats').emit('stats', stats.stats());
		},

		sendTrack: function (stationId, track) {
			io.to(stationId).emit('track', track);
		},

		handleConnection: function (socket) {
			log.info('connection', socket.id, this.getSocketAddress(socket));
			stats.incrementConnections();
			this.sendStats();

			socket.on('disconnect', this.handleDisconnect.bind(this, socket));
			socket.on('subscribe', this.handleSubscribe.bind(this, socket));
			socket.on('unsubscribe', this.handleUnsubscribe.bind(this, socket));
			socket.on('error', this.handleError.bind(this, socket));
		},

		handleError: function (socket, err) {
			log.error(err);
		},

		handleDisconnect: function (socket) {
			stats.decrementConnections();
			this.sendStats();
			log.info('disconnect', socket.id);
		},

		handleSubscribe: function (socket, stationId, ack) {
			if (typeof ack !== 'function') { ack = noop; }

			if (/^meta\:/.test(stationId)) {
				socket.join(stationId);
				return ack({ subscribed: stationId });
			}

			if (!stations[stationId]) {
				return ack({ error: 'Unknown station "' + stationId + '"' });
			}

			socket.join(stationId);
			ack({ subscribed: stationId });
			log.info('subscribe', socket.id, stationId);
		},

		handleUnsubscribe: function (socket, stationId, ack) {
			if (typeof ack !== 'function') { ack = noop; }

			if (/^meta\:/.test(stationId)) {
				socket.leave(stationId);
				return ack({ subscribed: stationId });
			}

			if (!stations[stationId]) {
				return ack({ error: 'Unknown station "' + stationId + '"' });
			}

			socket.leave(stationId);
			ack({ unsubscribed: stationId });
			log.info('unsubscribe', socket.id, stationId);
		}

	};

	io.on('connection', api.handleConnection.bind(api));

	return api;
};
