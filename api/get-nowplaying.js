var boom = require('boom');
var getStations = require('../get-stations');
var state = require('../state');

exports = module.exports = function (request, reply) {
	var stationId = request.params.stationId;

	getStations(function (err, stations) {
		if (err) { return reply(boom.internal()); }
		if (!stations[stationId]) { return reply(boom.notFound()); }

		var nowPlaying = state.getNowPlaying(stationId);
		if (!nowPlaying) { return reply(boom.serverTimeout('unavailable')); }

		reply(nowPlaying);
	});
};
