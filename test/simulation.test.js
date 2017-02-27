'use strict';

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

const _ = require('lodash');

const GameSetup = require('src/data/game.setup.js');
const GameHelper = require('./helpers/game.helper.js');
const PlayerHelper = require('./helpers/player.helper.js');
const ActionHelper = require('./helpers/action.helper.js');

const GameDB = require('src/data/game.data.js');
const GameService = require('src/services/game.service.js');
const ActionService = require('src/services/action.service.js');
const LogicService = require('src/services/logic.service.js');


describe('Simultaneous game simulations', function() {

	const numGamesToSimulate = 50;

	this.slow(numGamesToSimulate * 80);
	this.timeout(numGamesToSimulate * 100);

	before('Clear cache', () => {
		return testing.clearCache();
	});

	after('Clear cache', () => {
		return testing.clearCache();
	});

	it(`can play through ${numGamesToSimulate} concurrent games`, () => {
		const results = {
			'ohms win'  : 0,
			'spies win' : 0,
			'spies win (rejections)': 0,
		};

		const games = _.times(numGamesToSimulate, (id) => {
			const promiseWhile = function(conditionFn, run) {
				const loop = function() {
					if (!conditionFn()) {
						return Promise.resolve();
					}
					return run().then(loop);
				};
				return loop();
			};

			const numPlayers = _.random(5, 10);
			let gamePlayers;
			let game;

			// create players
			return Promise.all(_.times(numPlayers, () => PlayerHelper.createPlayer()))
				.then((ps) => {
					gamePlayers = ps;

					// create game
					return GameHelper.createGame();
				})
				.then((g) => {
					game = g;
					return Promise.all(
						_.map(gamePlayers, (player) => {
							return GameService.addPlayerToGame(game.id, player.id)
						})
					);
				})
				.then(() => {
					return GameService.getGame(game.id);
				})
				.then((g) => {
					game = g;
					return ActionService.startGame(game.id, game.players[0].id);
				})
				.then((game) => {
					return promiseWhile(
						() => {
							const gameOver = _.includes(['ohms win', 'spies win'], game.state);
							if (gameOver) {
								if (game.rounds[game.roundIndex].numRejections === 5) {
									// spies win by rejections
									results['spies win (rejections)']++;
								} else {
									results[game.state]++;
								}
							}
							return !gameOver;
						},
						() => {
							const currentRound = game.rounds[game.roundIndex];
							const leader = game.players[currentRound.leaderIndex];
							let promise;

							switch (game.state) {
								case 'selecting team':
									const team = ActionHelper.getRandomTeam(game);
									promise = ActionService.selectTeam(game.id, leader.id, team);
									break;
								case 'voting on team':
									promise = Promise.all(
										_.map(game.players, (player) => {
											// vote to approve x percent of the time
											const vote = Math.random() <= 0.55 ? true : false;
											return ActionService.submitTeamVote(game.id, player.id, vote);
										})
									);
									break;
								case 'executing mission':
									promise = Promise.all(
										_.map(currentRound.team, (playerId) => {
											const playerIndex = LogicService.getPlayerIndex(game, playerId);
											const amSpy = _.includes(game.spyIndices, playerIndex);
											let action = true;
											if (amSpy) {
												// spies fail x percent of the time
												action = Math.random() <= 0.52 ? false : true;
											}
											return ActionService.submitMissionAction(game.id, playerId, action);
										})
									);
									break;
								default:
									throw new Error(`Invalid game state: ${game.state}`);
							}

							return promise
								.then(() => {
									// refresh game
									return GameService.getGame(game.id);
								})
								.then((g) => { game = g; });
						}
					);
				});
		});

		return Promise.all(games)
			.then(() => {
				console.log(results);
			});
	});

});
