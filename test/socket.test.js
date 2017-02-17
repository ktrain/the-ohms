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
const GameSetup = require('src/data/game.setup.js');

const port = testing.config.get('port');


describe('WebSocket server', function() {
	this.slow(1500);

	const players = [];
	let game;
	let clients;
	let socketUrl;
	let gameSetup;

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

	before('Create game', () => {
		return GameHelper.createGame()
			.then((g) => {
				game = g;
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
		)
			.then(() => {
				 gameSetup = GameSetup.getGameSetupByNumPlayers(players.length);
			});
	});

	before('Connect clients', () => {
		clients = _.map(players, (player, i) => {
			return SocketIOClient(socketUrl, { query: `playerId=${player.id}&gameId=${game.id}` });
		});
	});

	afterEach('Clear client bindings', () => {
		_.each(clients, (client) => {
			client.removeAllListeners();
		});
	});

	after('Clear cache', () => {
		return testing.clearCache();
	});


	it('all clients should receive clientUpdate messages', (done) => {
		const events = _.times(players.length, () => null);
		_.each(clients, (client, i) => {
			// set up clientUpdate listener
			client.on('clientUpdate', (event) => {
				should.exist(event);
				event.should.have.property('type').that.equals('clientUpdate');
				event.should.have.property('payload').that.is.an('object');
				event.payload.should.have.property('id').that.equals(game.id);
				events[i] = event;
				if (_.every(events, (event) => !!event)) {
					done();
				}
			});
		});
	});

	it('`startGame` should populate game data', (done) => {
		clients[0].on('clientUpdate', (event) => {
			should.exist(event);
			event.should.have.property('type').that.equals('clientUpdate');
			event.should.have.property('payload').that.is.an('object');
			game = event.payload;
			event.payload.should.have.property('id').that.equals(game.id);
			if (event.payload.state === 'selecting team') {
				event.payload.should.have.property('spyIndices').with.lengthOf(gameSetup.numSpies);
				event.payload.should.have.property('currentRoundIndex').that.equals(0);
				event.payload.should.have.property('currentRound').that.is.an('object');
				event.payload.currentRound.should.have.property('leaderIndex').that.is.within(0, players.length-1);
				event.payload.currentRound.should.have.property('team').that.deep.equals([]);
				event.payload.currentRound.should.have.property('votes').that.deep.equals({});
				event.payload.currentRound.should.have.property('mission').that.deep.equals({});
				done();
			}
		});
		clients[0].emit('message', {
			version: 1,
			playerId: players[0].id,
			type: 'startGame',
		});
	});

	it('`selectTeam` proposes a team', (done) => {
		console.log('current round', game.currentRound);
		const leaderIndex = game.currentRound.leaderIndex;
		clients[leaderIndex].on('clientUpdate', (event) => {
			if (event.payload.state === 'voting on team') {
				done();
			}
		});
		const teamSize = game.rounds[game.currentRoundIndex].teamSize;
		clients[leaderIndex].emit('message', {
			version: 1,
			playerId: players[leaderIndex].id,
			type: 'selectTeam',
			payload: {
				team: _.chain(players).sampleSize(teamSize).map((player) => player.id).value(),
			},
		});
	});

});
