var somaEndpoint = 'http://somafm.com/channels.xml';
var request = require('request');
var parseXml = require('xml2js').parseString;

var cached = null;

exports = module.exports = function (callback, skipCache) {
	if (cached && skipCache !== true) {
		return process.nextTick(callback.bind(null, null, cached));
	}

	request(somaEndpoint, function (err, response, body) {
		if (err) { return callback(err); }
		if (response.statusCode !== 200) { return callback(new Error(':(')); }

		parseXml(body, { trim: true }, function (err, data) {
			if (err) { return callback(err); }

			function damnxml (v) {
				return Array.isArray(v) ? v[0] : v;
			}

			var channels = data.channels.channel;
			var stations = channels.reduce(function (obj, channel) {
				var stationId = channel.$.id;
				obj[stationId] = {
					id: stationId,
					title: damnxml(channel.title),
					description: damnxml(channel.description),
					dj: damnxml(channel.dj),
					genre: damnxml(channel.genre),
					image: {
						small: damnxml(channel.image),
						medium: damnxml(channel.largeimage),
						large: damnxml(channel.xlimage)
					}
				};
				return obj;
			}, {});

			cached = stations;
			callback(null, stations);
		});
	});
};
