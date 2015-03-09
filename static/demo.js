function getSocketIoUrl () {
	var urlObj = window.location;
	var port = urlObj.port;
	if (!port && urlObj.protocol === 'https:') { port = 443; }
	if (!port && urlObj.protocol !== 'https:') { port = 80; }
	return urlObj.protocol + '//' + urlObj.hostname + ':' + port;
}

var socket = io.connect(getSocketIoUrl());

var tbody = document.querySelector('#demo tbody');

socket.on('connect', function () {
	[   'groovesalad', 'secretagent',
		'doomed', 'u80s', 'bagel'
	].forEach(function (stationId) {
		socket.emit('subscribe', stationId);
	});
});

socket.on('track', function (track) {
	var tr = document.createElement('tr'),
		tdStation = document.createElement('td'),
		tdTime = document.createElement('td'),
		tdArtist = document.createElement('td'),
		tdTrack = document.createElement('td'),
		d = new Date();

	d.setTime(track.time);

	tdStation.textContent = track.stationId;
	tdTime.textContent = d;
	tdArtist.textContent = track.artist;
	tdTrack.textContent = track.title;

	tr.appendChild(tdStation);
	tr.appendChild(tdTime);
	tr.appendChild(tdArtist);
	tr.appendChild(tdTrack);

	tbody.insertBefore(tr, tbody.childNodes[0]);
});
