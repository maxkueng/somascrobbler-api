socket.emit('unsubscribe', 'groovesalad', function (data) {
	if (data.unsubscribed) { console.log('Unsubscribed!!'); }
});
