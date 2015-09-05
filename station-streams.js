var config = require('./config');
var log = require('bole')('streams');
var through2 = require('through2');
var EventEmitter = require('events').EventEmitter;
var somaStationStream = require('somastation');
var autocorrectStream = require('lastfm-autocorrect');
var stats = require('./stats');

module.exports = function (options) {
	var stations = options.stations || {};

	var emitter = new EventEmitter();
	createStationStreams(Object.keys(stations));

	function createAutocorrectStream () {
		var lastfmApiKey = config.get('lastfm.apikey');

		if (!lastfmApiKey) {
			return through2.obj(function (chunk, enc, next) {
				this.push(chunk);
				next();
			});
		}

		return autocorrectStream(lastfmApiKey);
	}

	function createStationIdInjectStream (stationId) {
		return through2.obj(function (track, enc, next) {
			track.stationId = stationId;
			this.push(track);
			next();
		});
	}

	function createSinkStream () {
		return through2.obj(function (chunk, enc, next) {
			next();
		});
	}

	function createEmitTrackStream () {
		return through2.obj(function (track, enc, next) {
			stats.updateLastTrackTime(track.stationId);
			emitter.emit('track', track);
			this.push(track);
			next();
		});
	}

	function createLogStream () {
		return through2.obj(function (track, enc, next) {
			log.info('track', track.stationId + ':', track.artist, '-', track.title);
			log.debug('track', track);
			this.push(track);
			next();
		});
	}

	function createStationStreams (stationIds) {
		stationIds.forEach(function (stationId) {
			var stream = somaStationStream(stationId, { pollInterval: parseInt(config.get('somafm.pollinterval'), 10) })
				.pipe(createAutocorrectStream())
				.pipe(createStationIdInjectStream(stationId))
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
