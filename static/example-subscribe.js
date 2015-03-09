socket.emit('subscribe', 'groovesalad', function (data) {
	if (data.subscribed) { console.log('Subscribed!!'); }
});
