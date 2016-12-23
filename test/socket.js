'use strict';

// always require the init file
const testing = require('./test.init.js');

const logger = require('src/util/logger.js')('test-socket');
const express = require('express');
const SocketIO = require('socket.io');
const SocketIOClient = require('socket.io-client');

const port = testing.config.get('port');


describe('WebSocket server', () => {

	before('Create server', (done) => {
		const app = express();
		const io = require('src/socket');
		const httpServer = app.listen(port, () => {
			io.attachToHttpServer(httpServer);
			logger.info('Test server listening on ' + port);
			done();
		});
	});

	it('should connect', (done) => {
		const io = SocketIOClient(`http://127.0.0.1:${port}`);
		io.on('connect', () => {
			logger.info('connected');
			done();
		});
	});

});
