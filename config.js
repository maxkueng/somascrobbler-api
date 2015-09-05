var path = require('path');
var fs = require('fs');

var defaults = fs.readFileSync(path.join(__dirname, 'defaults.yml'), 'utf-8');

module.exports = require('rucola')('somascrobblerapi', defaults);
