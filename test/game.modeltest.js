'use strict';

// always require the init file
const testing  = require('./test.init.js');

const PlayerHelper = require('./helpers/player.helper.js');
const GameHelper = require('./helpers/game.helper.js');


describe('Game model', () => {

	let player;
	let game;

	before('Create player', () => {
		return PlayerHelper.createPlayer()
			.then((p) => {
				player = p;
			});
	});

	before('Create game and add player', () => {
		return GameHelper.createGame()
			.then((g) => {
				game = g;
				return game.addPlayer(player);
			});
	});

	describe('#hasPlayerId', () => {

		it('returns true for a player ID in the game', () => {
			game.hasPlayerId(player.id)
				.should.equal(true);
		});

		it('returns false for a player ID not in the game', () => {
			return PlayerHelper.createPlayer()
				.then((player) => {
					game.hasPlayerId(player.id)
						.should.equal(false);
				});
		});

	});

});
