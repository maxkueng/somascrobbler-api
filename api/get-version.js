var pkg = require('../package.json');

exports = module.exports = function (request, reply) {
	reply({ version: pkg.version });
};
