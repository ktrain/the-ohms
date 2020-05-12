'use strict';

const path = require('path');

const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);

// initialize config
const configPath = path.resolve(`${rootPath}/config`);
const config = require('nconf')
	.argv()
	.env({ lowerCase: true, separator: ':' })
	.file('testing', { file: `${rootPath}/test/config/testing.json` })
	.file('environment', { file: `${configPath}/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: `${configPath}/default.json` });

// set up event subscriptions
const Events = require('src/events.js');
Events.setUpSubscriptions();

// other libs
const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-shallow-deep-equal'))
	.should();

const Cache = require('src/util/cache.js');
Cache.init();
after('Tear down Cache', Cache.deinit);

module.exports = {
	config: config,
	should: should,
	clearCache: () => {
		return new Promise((resolve, reject) => {
			Cache.getRawClientYesIKnowWhatImDoing()
				.flushdb((err) => {
					if (err) {
						return reject(new Error(err));
					}
					resolve();
				});
		});
	},
};
