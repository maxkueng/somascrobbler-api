var moment = require('moment');

module.exports = {
	startTime: +moment.utc(),

	lastTrackUpdates: {},

	connectionCount: 0,

	uptime: function () {
		return +moment.utc() - this.startTime;
	},

	updateLastTrackTime: function (stationId) {
		this.lastTrackUpdates[stationId] = +moment.utc();
	},

	incrementConnections: function (inc) {
		if (typeof inc === 'undefined') { inc = 1; }
		this.connectionCount += inc;
	},

	decrementConnections: function () {
		this.incrementConnections(-1);
	},

	stats: function () {
		return {
			uptime_ms: this.uptime(),
			connections: this.connectionCount,
			lastTrackUpdates: this.lastTrackUpdates
		}
	}
};
