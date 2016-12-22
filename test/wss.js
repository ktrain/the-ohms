'use strict';

// always require the init file
const testing = require('./test.init.js');

const logger = require('src/util/logger.js')('test-wss');
const express = require('express');
const WebSocket = require('ws');

const port = testing.config.get('port');


describe('WebSocket server', () => {

	before('Create server', (done) => {
		const app = express();
		const wss = require('src/wss');
		const httpServer = app.listen(port, () => {
			wss.attachToHttpServer(httpServer);
			logger.info('Test server listening on ' + port);
			done();
		});
	});

	it('should connect', (done) => {
		const ws = new WebSocket(`ws://127.0.0.1:${port}`);
		ws.on('open', () => {
			logger.info('opened');
			done();
		});
	});

});
