'use strict';

const log4js = require('log4js');
const config = require('nconf');

module.exports = (name) => {
	const logger = log4js.getLogger(name);
	const logLevel = config.get('logging:forceLevel')
			|| config.get(`log:${name}:level`)
			|| config.get('logging:defaultLevel');
	logger.level = logLevel;
	return logger;
};
