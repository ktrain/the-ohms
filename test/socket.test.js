'use strict';

const _ = require('lodash');

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

const logger = require('src/util/logger.js')('test-socket');
const express = require('express');
const SocketIOClient = require('socket.io-client');

const PlayerHelper = require('./helpers/player.helper.js');
const GameHelper = require('./helpers/game.helper.js');
const GameSetup = require('src/data/game.setup.js');
const GameService = require('src/services/game.service.js');
const GameDB = require('src/data/game.data.js');

const port = testing.config.get('port');


describe('WebSockets', function() {
	this.slow(1500);

	const clients = [];
	let httpServer;
	let players;
	let game;
	let socketUrl;
	let gameSetup;

	before('Clear cache', () => {
		return testing.clearCache();
	});

	before('Create httpServer', (done) => {
		const app = express();
		const io = require('src/socket');
		httpServer = app.listen(port, () => {
			io.attachToHttpServer(httpServer);
			logger.info('Test server listening on ' + port);
			socketUrl = `http://127.0.0.1:${port}`;
			done();
		});
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
				return PlayerHelper.createPlayer();
			})
		)
			.then((ps) => {
				players = ps;
				gameSetup = GameSetup.getDataByNumPlayers(players.length);
			});
	});

	before('Connect clients', () => {
		const cs = {};
		_.each(players, (player, i) => {
			cs[player.id] = SocketIOClient(socketUrl, { query: `playerId=${player.id}&gameId=${game.id}` });
		});
		return new Promise((resolve) => {
			setTimeout(() => {
				GameService.getGame(game.id)
					.then((g) => {
						game = g;
						_.each(game.players, (player, i) => {
							clients[i] = cs[player.id];
						});
						resolve();
					});
			}, 500);
		});
	});

	beforeEach('Refresh game data', () => {
		return GameService.getGame(game.id)
			.then((g) => { game = g; });
	});

	afterEach('Clear client bindings', () => {
		_.each(clients, (client) => client.removeAllListeners());
	});

	after('Disconnect clients', () => {
		_.each(clients, (client) => client.disconnect());
	});

	after('Clear cache', () => {
		return testing.clearCache();
	});

	after('Close server', (done) => {
		httpServer.close(done);
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
		// trigger a save
		GameService.getGame(game.id)
			.then((g) => {
				return GameDB.save(g);
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
				event.payload.should.have.property('roundIndex').that.equals(0);
				event.payload.should.have.property('rounds').that.is.an('array').with.lengthOf(5);

				const currentRound = event.payload.rounds[0];
				currentRound.should.be.an('object');
				currentRound.should.have.property('leaderIndex').that.is.within(0, players.length-1);
				currentRound.should.have.property('team').that.deep.equals([]);
				currentRound.should.have.property('votes').that.deep.equals({});
				currentRound.should.have.property('mission').that.deep.equals({});
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
		const currentRound = game.rounds[game.roundIndex];
		const leaderIndex = currentRound.leaderIndex;
		clients[leaderIndex].on('clientUpdate', (event) => {
			if (event.payload.state === 'voting on team') {
				done();
			}
		});
		const teamSize = currentRound.teamSize;
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
