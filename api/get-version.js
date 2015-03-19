var pkg = require('../package.json');

exports = module.exports = function (request, reply) {
	reply({
		version: pkg.version,
		socketIo: pkg.dependencies['socket.io'].replace(/[^0-9.]/g, '')
	});
};
