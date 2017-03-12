'use strict';

const logger = require('loglevel');
if (typeof global.Config === 'object') {
	logger.setLevel(global.Config.logLevel);
}

module.exports = logger;
