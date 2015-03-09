var config = require('./config');
var log = require('bole')('streams');
var through2 = require('through2');
var EventEmitter = require('events').EventEmitter;
var SomaStationStream = require('somastation');
var autocorrectStream = require('lastfm-autocorrect');
var stats = require('./stats');

module.exports = function (options) {
	var stations = options.stations || {};

	var emitter = new EventEmitter();
	createStationStreams(Object.keys(stations));

	function createAutocorrectStream () {
		return autocorrectStream(config.lastfmApiKey);
	}

	function createSinkStream () {
		return through2.obj(function (chunk, enc, next) {
			next();
		});
	}

	function createEmitTrackStream (stationId) {
		return through2.obj(function (track, enc, next) {
			stats.updateLastTrackTime(stationId);
			emitter.emit('track', stationId, track);
			this.push(track);
			next();
		});
	}

	function createLogStream () {
		return through2.obj(function (track, enc, next) {
			this.push(track);
			next();
		});
	}

	function createStationStreams (stationIds) {
		stationIds.forEach(function (stationId) {
			var stream = new SomaStationStream(stationId)
				.pipe(createAutocorrectStream())
				.pipe(createLogStream())
				.pipe(createEmitTrackStream(stationId))
				.pipe(createSinkStream())
				.on('error', function (err) {
					log.error(err);
				});
		});
	}

	return emitter;
};
