'use strict';

const _ = require('lodash');

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

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
	let clients;
	let socketUrl;

	before('Clear cache', () => {
		return testing.clearCache();
	});

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

	before('Set up subscriptions', () => {
		Events.setUpSubscriptions();
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

	beforeEach('Create clients', () => {
		clients = _.map(players, (player, i) => {
			return SocketIOClient(socketUrl, { query: `playerId=${player.id}` });
		});
	});

	afterEach('Disconnect clients', () => {
		_.each(clients, (client) => {
			client.disconnect();
		});
	});

	after('Clear cache', () => {
		return testing.clearCache();
	});

	it('all clients should receive clientUpdate messages', (done) => {
		let game;
		const events = _.times(players.length, () => null);
		_.each(clients, (client, i) => {
			// set up clientUpdate listener
			client.on('clientUpdate', (event) => {
				should.exist(event);
				event.should.have.property('type').that.equals('clientUpdate');
				event.should.have.property('payload').that.is.an('object');
				event.payload.should.have.property('id').that.equals(game.getData().id);
				events[i] = event;
				if (_.every(events, (event) => !!event)) {
					done();
				}
			});
		});
		// create game and have the players join
		GameHelper.createGame()
			.then((g) => {
				game = g;
				_.each(clients, (client, i) => {
					client.emit('message', JSON.stringify({
						version: 1,
						playerId: players[i].id,
						type: 'joinGame',
						payload: {
							gameId: game.getData().id,
						},
					}));
				});
			});
	});

	it('`startGame` should trigger clientUpdate messages', (done) => {
		let game;
		const events = _.times(players.length, () => null);
		_.each(clients, (client, i) => {
			client.on('clientUpdate', (event) => {
				should.exist(event);
				event.should.have.property('type').that.equals('clientUpdate');
				event.should.have.property('payload').that.is.an('object');
				event.payload.should.have.property('id').that.equals(game.getData().id);
				if (event.payload.state === 'selecting team') {
					events[i] = event;
					if (_.every(events, (event) => !!event)) {
						done();
					}
				}
			});
		});
		GameHelper.createGame()
			.then((g) => {
				game = g;
				_.each(clients, (client, i) => {
					client.emit('message', JSON.stringify({
						version: 1,
						playerId: players[i].id,
						type: 'joinGame',
						payload: {
							gameId: game.getData().id,
						},
					}));
				});
				clients[0].emit('message', JSON.stringify({
					version: 1,
					playerId: players[0].id,
					type: 'startGame',
					payload: {
						gameId: game.getData().id,
					},
				}));
			});
	});

});
