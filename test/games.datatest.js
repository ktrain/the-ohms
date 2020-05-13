'use strict';

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

const _ = require('lodash');

const GameHelper = require('./helpers/game.helper.js');
const GameDB = require('src/data/game.data.js');
const GameService = require('src/services/game.service.js');
const PlayerService = require('src/services/player.service.js');
const PlayerHelper = require('./helpers/player.helper.js');

describe('GameDB', () => {

	it('generates ID on build', () => {
		const gameData = GameDB.build();
		should.exist(gameData);
		gameData.should.have.property('id').that.is.a('string');
		gameData.should.have.property('name').that.is.a('string');
	});

});

describe('Game Service', function() {

	this.slow(200);

	let players;
	let game;

	beforeEach('Create players', () => {
		return Promise.all(
			_.times(10, () => PlayerHelper.createPlayer())
		)
			.then((ps) => {
				players = ps;
			});
	});

	beforeEach('Create game', () => {
		return GameHelper.createGame()
			.then((g) => {
				game = g;
			});
	});

	afterEach('Clear games', () => {
		return GameHelper.clearGames();
	});

	afterEach('Clear players', () => {
		return PlayerHelper.clearPlayers();
	});

	describe('#addPlayerToGame', () => {

		it('should add the player to the players array', () => {
			return GameService.addPlayerToGame(game.id, players[0].id)
				.then((game) => {
					should.exist(game);
					game.should.have.property('players').that.deep.includes.members([players[0]]);
				});
		});

		it('should mark the player in the cache with the game ID', () => {
			return GameService.addPlayerToGame(game.id, players[0].id)
				.then(() => {
					// give time for the event emitter to fire
					return new Promise(resolve => setTimeout(resolve, 150));
				}).then(() => {
					return PlayerService.getPlayer(players[0].id);
				}).then((player) => {
					should.exist(player);
					player.should.have.property('gameId').that.equals(game.id);
				});
		});

	});

	describe('#removePlayerFromGame', () => {

		beforeEach('Add players to game', () => {
			return Promise.all(
				_.map(players, (player) => {
					return GameService.addPlayerToGame(game.id, player.id);
				})
			);
		});

		it('should remove the player from the players array', () => {
			return GameService.removePlayerFromGame(game.id, players[0].id)
				.then((game) => {
					should.exist(game);
					game.should.have.property('players');
					game.players.should.not.deep.include.members([players[0]]);
				});
		});

		it('should clear the game ID from the player in cache', () => {
			return GameService.removePlayerFromGame(game.id, players[0].id)
				.then(() => {
					// give time for the event emitter to fire
					return new Promise(resolve => setTimeout(resolve, 150));
				}).then(() => {
					return PlayerService.getPlayer(players[0].id);
				}).then((player) => {
					should.exist(player);
					player.should.not.have.property('gameId');
				});
		});

		it('delete the game when the last player is removed', () => {
			return Promise.all(
				_.map(players, (player) => {
					return GameService.removePlayerFromGame(game.id, player.id);
				})
			)
				.then(() => {
					return GameService.getGame(game.id);
				})
				.then((game) => {
					should.not.exist(game);
				});
		});

	});

});
