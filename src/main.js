'use strict';

const path = require('path');
const basePath = path.resolve(`${__dirname}/..`);
const configPath = `${basePath}/config`;

require('app-module-path').addPath(basePath);

const logger = require('src/util/logger.js')('main');

// initialize config
const config = require('nconf')
	.argv()
	.env({ lowerCase: true, separator: ':' })
	.file('environment', { file: `${configPath}/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: `${configPath}/default.json` });

const app = require('src/app');
const socket = require('src/socket');
const events = require('src/events');

events.setUpSubscriptions();

require('src/util/cache').init();

// start the http server
const port = process.env.PORT || 8000;
const httpServer = app.listen(port, () => {
	// attach ws server
	socket.attachToHttpServer(httpServer);
	logger.info('Listening on ' + port);
});
