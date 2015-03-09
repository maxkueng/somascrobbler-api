(function () {

function getStations (callback) {
	superagent
		.get('/api/v1/stations')
		.set('Accept', 'application/json')
		.end(function (err, res) {
			callback(err, res.body);
		});
}

function getStats (callback) {
	superagent
		.get('/api/v1/stats')
		.set('Accept', 'application/json')
		.end(function (err, res) {
			callback(err, res.body);
		});
}

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function getSocketIoUrl () {
	var urlObj = window.location;
	var port = urlObj.port;
	if (!port && urlObj.protocol === 'https:') { port = 443; }
	if (!port && urlObj.protocol !== 'https:') { port = 80; }
	return urlObj.protocol + '//' + urlObj.hostname + ':' + port;
}

function getSocketIoClientUrl () {
	return window.location.origin + '/socket.io/socket.io.js';
}

function patchDocs () {
	var clientIncludeHTML = escapeHtml('<script src="' + getSocketIoClientUrl() + '"></script>');
	var clientIncludeEl = document.querySelector('.client-include');
	clientIncludeEl.innerHTML = clientIncludeHTML;

	var socketioConnectHTML = escapeHtml('var socket = io.connect(\'' + getSocketIoUrl() + '\');');
	var socketioConnectEl = document.querySelector('.socketio-connect');
	socketioConnectEl.innerHTML = socketioConnectHTML;
}

var stationElements = {};

function createStationElements (stations) {
	var stationsEl = document.querySelector('.stations');

	Object.keys(stations).forEach(function (stationId) {
		var station = stations[stationId];
		var div = document.createElement('div');
		div.id = 'station-' + stationId;
		div.className = 'station';

		var a = document.createElement('a');
		a.href = 'http://somafm.com/' + stationId + '/';
		a.innerHTML = station.title;

		div.appendChild(a);

		stationElements[stationId] = a;
		stationsEl.appendChild(div);
	});
}

function updateStats (stats) {
	var connectionsEl = document.querySelector('.stats .connected-clients .value');
	var uptimeEl = document.querySelector('.stats .uptime .value');
	connectionsEl.innerHTML = stats.connections;
	uptimeEl.innerHTML = Math.floor(stats.uptime_ms / 1000);

	Object.keys(stats.lastTrackUpdates).forEach(function (stationId) {
		var time = stats.lastTrackUpdates[stationId];
		var el = stationElements[stationId];

		if (!el) { return; }
		el.setAttribute('data-lastupdate', time);
	});
}

function startStationColorUpdate () {
	var fgColors = [ tinycolor('#efefef'), tinycolor('#333') ];

	setInterval(function () {
		var now = +moment.utc();
		var tolerance = 1200000;

		Object.keys(stationElements).forEach(function (stationId) {
			var el = stationElements[stationId];
			var lastUpdate = parseInt(el.getAttribute('data-lastupdate'), 10);
			var delta = now - lastUpdate;
			var hue = 120 - (120 / tolerance * delta);
			var background = tinycolor('hsv (' + hue + ' 100% 100%)');
			var border = tinycolor.darken(background);
			var color = tinycolor.mostReadable(background, fgColors);

			el.style.backgroundColor = background.toRgbString();
			el.style.borderColor = border.toRgbString();
			el.style.color = color.toRgbString();
		});
	}, 1000);
}

patchDocs();

getStations(function (err, stations) {

	createStationElements(stations);
	startStationColorUpdate();

	var socket = io.connect(getSocketIoUrl());

	socket.on('connect', function () {

		getStats(function (err, stats) {
			if (!err) { updateStats(stats); }
		});
	
		socket.emit('subscribe', 'meta:stats');
		socket.on('stats', updateStats);
	
	});

});

})();
