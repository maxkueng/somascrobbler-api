var stats = require('../stats');

exports = module.exports = function (request, reply) {
	reply(stats.stats());
};
