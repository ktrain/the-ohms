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


describe('Game flow', () => {

	const numPlayers = 10;
	let players;
	let game;
	let stranger;
	let setup = GameSetup.getDataByNumPlayers(numPlayers);

	beforeEach('Create players', () => {
		return Promise.all(_.times(numPlayers, () => PlayerHelper.createPlayer()))
			.then((ps) => {
				players = ps;
				return PlayerHelper.createPlayer();
			})
			.then((p) => {
				stranger = p;
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

	afterEach('Clear cache', () => {
		return testing.clearCache();
	});


	describe('State transitions', function() {

		this.slow(700);

		it('`waiting for players` => `selecting team`', () => {
			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					g.should.have.property('state').that.equals('selecting team');

					const setup = GameSetup.getDataByNumPlayers(game.players.length);

					g.should.have.property('rounds');
					g.should.have.property('roundIndex').that.equals(0);
					g.rounds[g.roundIndex].should.have.property('leaderIndex').within(0, players.length-1);

					_.each(g.rounds, (round, i) => {
						round.should.shallowDeepEqual(setup.rounds[i]);
					});

					g.should.have.property('spyIndices').that.is.an('array').with.length(setup.numSpies);
				});
		});

		it('`selecting team` => `voting on team`', () => {
			let team;

			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					game = g;
					const currentRound = game.rounds[game.roundIndex];
					const leader = game.players[currentRound.leaderIndex];
					team = ActionHelper.getRandomTeam(game);
					return ActionService.selectTeam(game.id, leader.id, team);
				})
				.then((g) => {
					game = g;
					const currentRound = game.rounds[game.roundIndex];
					game.should.have.property('state').that.equals('voting on team');
					game.rounds[game.roundIndex].should.have.property('team').that.has.members(team);
				});
		});

		it('`voting on team` => `selecting team`', () => {
			let leader;
			let startingLeaderIndex;
			let startingRoundIndex;

			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					// submit team
					game = g;
					startingRoundIndex = game.roundIndex;
					const currentRound = game.rounds[game.roundIndex];
					startingLeaderIndex = currentRound.leaderIndex;
					leader = game.players[currentRound.leaderIndex];
					const team = ActionHelper.getRandomTeam(game);
					return ActionService.selectTeam(game.id, leader.id, team);
				})
				.then((g) => {
					// submit all rejects
					game = g;
					return Promise.all(
						_.map(game.players, (player) => {
							return ActionService.submitTeamVoteReject(game.id, player.id);
						})
					)
					.then(() => {
						return GameService.getGame(game.id);
					});
				})
				.then((g) => {
					game = g;
					game.should.have.property('state').that.equals('selecting team');
					game.should.have.property('roundIndex').that.equals(startingRoundIndex);

					const currentRound = game.rounds[game.roundIndex];
					currentRound.should.have.property('numRejections').that.equals(1);
					currentRound.should.have.property('votes').that.deep.equals({});
					const expectedLeaderIndex = (startingLeaderIndex + 1) % game.players.length;
					currentRound.should.have.property('leaderIndex').that.equals(expectedLeaderIndex);
				});
		});

		it('`voting on team` => `spies win`', () => {
			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					game = g;

					// submit and reject team 5 times
					return _.reduce(_.range(0, 5), (promise) => {
						return promise.then((g) => {
							game = g;
							const currentRound = game.rounds[game.roundIndex];
							const leader = game.players[currentRound.leaderIndex];
							const team = ActionHelper.getRandomTeam(game);
							// submit team
							return ActionService.selectTeam(game.id, leader.id, team)
								.then((g) => {
									return Promise.all(
										// reject
										_.map(game.players, (player) => {
											return ActionService.submitTeamVoteReject(game.id, player.id);
										})
									)
									.then(() => {
										// refresh game
										return GameService.getGame(game.id);
									});
								});
						});
					}, Promise.resolve(game));
				})
				.then((g) => {
					game = g;

					game.should.have.property('state').that.equals('spies win');
				});
		});

		it('`voting on team` => `executing mission`', () => {
			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					game = g;
					const currentRound = game.rounds[game.roundIndex];
					const leader = game.players[currentRound.leaderIndex];
					const team = ActionHelper.getRandomTeam(game);
					// submit team
					return ActionService.selectTeam(game.id, leader.id, team);
				})
				.then((g) => {
					game = g;
					// approve team
					return Promise.all(
						_.map(game.players, (player) => {
							return ActionService.submitTeamVoteApprove(game.id, player.id);
						})
					)
					.then(() => {
						// refresh game
						return GameService.getGame(game.id);
					});
				})
				.then((g) => {
					game = g;
					game.should.have.property('state').that.equals('executing mission');
				});
		});

		it('`executing mission` => `selecting team`', () => {
			let startingLeaderIndex;

			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					game = g;
					const currentRound = game.rounds[game.roundIndex];
					startingLeaderIndex = currentRound.leaderIndex;
					const leader = game.players[currentRound.leaderIndex];
					const team = ActionHelper.getRandomTeam(game);
					// submit team
					return ActionService.selectTeam(game.id, leader.id, team);
				})
				.then((g) => {
					game = g;
					// approve team
					return Promise.all(
						_.map(game.players, (player) => {
							return ActionService.submitTeamVoteApprove(game.id, player.id);
						})
					);
				})
				.then((g) => {
					return Promise.all(
						_.map(game.rounds[game.roundIndex].team, (playerId) => {
							const action = ActionHelper.getRandomBoolean();
							return ActionService.submitMissionAction(game.id, playerId, action);
						})
					)
					.then(() => {
						return GameService.getGame(game.id);
					});
				})
				.then((g) => {
					game = g;

					game.should.have.property('state').that.equals('selecting team');
					game.should.have.property('numSuccesses').that.is.within(0, 1);
					game.should.have.property('numFails').that.equals(1 - game.numSuccesses);
					game.should.have.property('roundIndex').that.equals(1);

					const expectedLeaderIndex = (startingLeaderIndex + 1) % game.players.length;
					game.rounds[game.roundIndex].should.have.property('leaderIndex').that.equals(expectedLeaderIndex);
				});
		});

		it('`executing mission` => `ohms win`', () => {
			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					game = g;

					// submit and approve team, then succeed mission 3 times
					return _.reduce(_.range(0, 3), (promise) => {
						return promise.then((g) => {
							game = g;
							const currentRound = game.rounds[game.roundIndex];
							const leader = game.players[currentRound.leaderIndex];
							const team = ActionHelper.getRandomTeam(game);
							// submit team
							return ActionService.selectTeam(game.id, leader.id, team)
								.then((g) => {
									game = g;
									return Promise.all(
										// approve
										_.map(game.players, (player) => {
											return ActionService.submitTeamVoteApprove(game.id, player.id);
										})
									)
									.then(() => {
										// refresh game
										return GameService.getGame(game.id);
									})
									.then((g) => {
										game = g;
										const currentRound = game.rounds[game.roundIndex];
										// succeed
										return Promise.all(
											_.map(currentRound.team, (playerId) => {
												return ActionService.submitMissionSucceed(game.id, playerId);
											})
										);
									})
									.then(() => {
										// refresh game
										return GameService.getGame(game.id);
									});
								});
						});
					}, Promise.resolve(game));
				})
				.then((g) => {
					game = g;

					game.should.have.property('state').that.equals('ohms win');
				});
		});

		it('`executing mission` => `spies win`', () => {
			return ActionService.startGame(game.id, game.players[0].id)
				.then((g) => {
					game = g;

					// submit and approve team, then fail mission 3 times
					return _.reduce(_.range(0, 3), (promise) => {
						return promise.then((g) => {
							game = g;
							const currentRound = game.rounds[game.roundIndex];
							const leader = game.players[currentRound.leaderIndex];
							const team = ActionHelper.getRandomTeam(game);
							// submit team
							return ActionService.selectTeam(game.id, leader.id, team)
								.then((g) => {
									game = g;
									return Promise.all(
										// approve
										_.map(game.players, (player) => {
											return ActionService.submitTeamVoteApprove(game.id, player.id);
										})
									)
									.then(() => {
										// refresh game
										return GameService.getGame(game.id);
									})
									.then((g) => {
										game = g;
										const currentRound = game.rounds[game.roundIndex];
										// fail
										return Promise.all(
											_.map(currentRound.team, (playerId) => {
												return ActionService.submitMissionFail(game.id, playerId);
											})
										);
									})
									.then(() => {
										// refresh game
										return GameService.getGame(game.id);
									});
								});
						});
					}, Promise.resolve(game));
				})
				.then((g) => {
					game = g;

					game.should.have.property('state').that.equals('spies win');
				});
		});

	});

});
