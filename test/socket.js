'use strict';

// always require the init file
const testing = require('./test.init.js');

const PlayerHelper = require('./helpers/player.helper.js');
const logger = require('src/util/logger.js')('test-socket');
const express = require('express');
const SocketIO = require('socket.io');
const SocketIOClient = require('socket.io-client');

const port = testing.config.get('port');


describe('WebSocket server', () => {

	let player;

	before('Create server', (done) => {
		const app = express();
		const io = require('src/socket');
		const httpServer = app.listen(port, () => {
			io.attachToHttpServer(httpServer);
			logger.info('Test server listening on ' + port);
			done();
		});
	});

	before('Create player', () => {
		return PlayerHelper.createPlayer()
			.then((p) => {
				player = p;
			});
	});

	it('should connect', (done) => {
		const io = SocketIOClient(`http://127.0.0.1:${port}`, { query: `playerId=${player.id}` });
		io.on('connect', () => {
			logger.info('connected');
			done();
		});
	});

});
