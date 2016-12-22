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
const wss = require('src/wss');

// log http requests
app.use((req, res, next) => {
	logger.debug('---------------------------');
	logger.debug(req.method, req.path);

	if (req.params) {
		logger.debug('req params', req.params);
	}
	if (req.query) {
		logger.debug('req query', req.query);
	}

	next();
});

// start the http server
const port = process.env.PORT || 8000;
const httpServer = app.listen(port, () => {
	// attach ws server
	wss.attachToHttpServer(httpServer);
	logger.info('Listening on ' + port);
});
