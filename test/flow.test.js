'use strict';

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

const _ = require('lodash');

const GameSetup = require('src/data/game.setup.js');
const GameHelper = require('./helpers/game.helper.js');
const ActionService = require('src/services/action.service.js');
const GameService = require('src/services/game.service.js');
const PlayerService = require('src/services/player.service.js');
const PlayerHelper = require('./helpers/player.helper.js');


describe('Game Flow', () => {

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

	beforeEach('Add players to game', () => {
		return Promise.all(
			_.map(players, (player) => {
				return GameService.addPlayerToGame(game.id, player.id)
			})
		)
			.then(() => {
				return GameService.getGame(game.id);
			})
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


	describe('#startGame', () => {

		it('rejects non-oldest player', () => {
			return ActionService.startGame(game.id, game.players[1].id)
				.should.be.rejected;
		});

		it('accepts the oldest player', () => {
			return ActionService.startGame(game.id, game.players[0].id)
				.then((game) => {
					game.should.have.property('state').that.equals('selecting team');
					game.should.have.property('rounds').that.deep.equals
				});
		});

	});

	describe('#selectTeam', () => {
	});

});
