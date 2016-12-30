'use strict';

const _ = require('lodash');

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

	const players = [];
	let socketUrl;

	before('Create server', (done) => {
		const app = express();
		const io = require('src/socket');
		const httpServer = app.listen(port, () => {
			io.attachToHttpServer(httpServer);
			logger.info('Test server listening on ' + port);
			socketUrl = `http://127.0.0.1:${port}`;
			done();
		});
	});

	before('Create players', () => {
		return Promise.all(
			_.times(10, (i) => {
				return PlayerHelper.createPlayer()
					.then((p) => {
						players[i] = p;
					});
			})
		);
	});

	before('Set up subscriptions', () => {
		Events.setUpSubscriptions();
	});

	it('should connect', (done) => {
		const client = SocketIOClient(socketUrl, { query: `playerId=${players[0].id}` });
		client.on('connect', () => {
			logger.info('connected');
			client.disconnect();
			done();
		});
	});

	it('a client should receive clientUpdate messages', (done) => {
		let game;

		const client = SocketIOClient(socketUrl, { query: `playerId=${players[0].id}` });

		client.on('clientUpdate', (event) => {
			event.should.have.property('type').that.equals('clientUpdate');
			event.should.have.property('payload').that.deep.equals(game.getData());
			client.disconnect();
			done();
		});

		GameHelper.createGame()
			.then((g) => {
				game = g;
				game.addPlayer(players[0]);
			});
	});

	context('When there are multiple clients:', () => {

		it('all should receive clientUpdate messages', (done) => {
			let game;
			const events = _.times(players.length, () => null);
			const clients = _.map(players, (player, i) => {
				const client = SocketIOClient(socketUrl, { query: `playerId=${player.id}` });
				client.on('clientUpdate', (event) => {
					events[i] = event;
					if (_.every(events, (event) => !!event)) {
						done();
					}
				});
				return client;
			});
			GameHelper.createGame()
				.then((g) => {
					game = g;
					_.each(players, (player) => {
						game.addPlayer(player);
					});
				});
		});

	});

});
