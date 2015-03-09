module.exports = {

	nowPlaying: {},

	setNowPlaying: function (stationId, track) {
		this.nowPlaying[stationId] = track;
	},

	getNowPlaying: function (stationId) {
		if (!this.nowPlaying[stationId]) {
			return null;
		}

		return this.nowPlaying[stationId];
	}

};
