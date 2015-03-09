var boom = require('boom');
var getStations = require('../get-stations');

exports = module.exports = function (request, reply) {
	getStations(function (err, stations) {
		if (err) { return reply(boom.internal()); }

		reply(stations);
	});
};

