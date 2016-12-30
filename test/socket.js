'use strict';

// always require the init file
const testing = require('./test.init.js');

const logger = require('src/util/logger.js')('test-socket');
const express = require('express');
const SocketIO = require('socket.io');
const SocketIOClient = require('socket.io-client');

const PlayerHelper = require('./helpers/player.helper.js');
const GameHelper = require('./helpers/game.helper.js');
const Events = require('src/events.js');

const port = testing.config.get('port');


describe('WebSocket server', () => {

	let player;
	let socket;

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

	before('Set up subscriptions', () => {
		Events.setUpSubscriptions();
	});

	it('should connect', (done) => {
		const client = SocketIOClient(`http://127.0.0.1:${port}`, { query: `playerId=${player.id}` });
		client.on('connect', () => {
			logger.info('connected');
			client.disconnect();
			done();
		});
	});

	it('should receive clientUpdate messages', (done) => {
		let game;
		const client = SocketIOClient(`http://127.0.0.1:${port}`, { query: `playerId=${player.id}` });

		client.on('clientUpdate', (event) => {
			event.should.have.property('type').that.equals('clientUpdate');
			event.should.have.property('payload').that.deep.equals(game.getData());
			client.disconnect();
			done();
		});

		GameHelper.createGame()
			.then((g) => {
				game = g;
				game.addPlayer(player);
			});
	});

});
