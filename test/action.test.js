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


describe('Action Service', function() {

	this.slow(200);

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


	describe('#startGame', () => {

		it('can only be used before game starts', () => {
			return GameDB.save(LogicService.startGame(game))
				.then((g) => {
					game = g;
					return ActionService.startGame(game.id,game.players[0].id)
						.should.be.rejectedWith(/already started/);
				});
		});

		it('rejects non-oldest player', () => {
			return ActionService.startGame(game.id,game.players[1].id)
				.should.be.rejectedWith(/can only be started/);
		});

		it('accepts the oldest player', () => {
			return ActionService.startGame(game.id,game.players[0].id)
				.then((game) => {
				});
		});

	});


	describe('#selectTeam', () => {

		let leader;
		let currentRound;

		beforeEach('Prepare game', () => {
			return GameDB.save(LogicService.startGame(game))
				.then((g) => {
					game = g;
					currentRound = game.rounds[game.roundIndex];
					leader = game.players[currentRound.leaderIndex];
				});
		});


		it('rejects team from non-leader', () => {
			const playerAfterLeader = LogicService.getNextLeaderIndex(game);
			const team = ActionHelper.getRandomTeam(game, currentRound.teamSize);
			return ActionService.selectTeam(game.id, playerAfterLeader.id, team)
				.should.be.rejectedWith(/round leader/);
		});

		it('rejects team that is too small', () => {
			const team = ActionHelper.getRandomTeam(game, currentRound.teamSize - 1);
			return ActionService.selectTeam(game.id, leader.id, team)
				.should.be.rejectedWith(/must have \d+ players/);
		});

		it('rejects team that is too big', () => {
			const team = ActionHelper.getRandomTeam(game, currentRound.teamSize + 1);
			return ActionService.selectTeam(game.id, leader.id, team)
				.should.be.rejectedWith(/must have \d+ players/);
		});

		it('rejects team that has player not in game', () => {
			const team = ActionHelper.getRandomTeam(game, currentRound.teamSize - 1);
			team.push(stranger.id);
			return ActionService.selectTeam(game.id, leader.id, team)
				.should.be.rejectedWith(/not in the game/);
		});

		it('accepts a proper team from the leader', () => {
			const team = ActionHelper.getRandomTeam(game, currentRound.teamSize);
			return ActionService.selectTeam(game.id, leader.id, team);
		});

		it('can only be used during `selecting team` state', () => {
			const team = ActionHelper.getRandomTeam(game, currentRound.teamSize);
			return ActionService.selectTeam(game.id, leader.id, team)
				.then(() => {
					return ActionService.selectTeam(game.id, leader.id, team)
						.should.be.rejectedWith(/`selecting team` state/);
				});
		});

	});


	describe('#submitTeamVote', () => {

		let currentRound;

		beforeEach('Prepare game', () => {
			game = LogicService.startGame(game);
			currentRound = game.rounds[game.roundIndex];
			game = LogicService.selectTeam(game, _.map(game.players.slice(0, currentRound.teamSize), 'id'));
			return GameDB.save(game)
				.then((g) => {
					game = g;
				});
		});


		it('rejects vote from player not in game', () => {
			return ActionService.submitTeamVote(game.id, stranger.id, true)
				.should.be.rejectedWith(/not in game/);
		});

		it('accepts vote from a player in the game', () => {
			const vote = ActionHelper.getRandomBoolean();
			return ActionService.submitTeamVote(game.id,game.players[0].id, vote)
				.then((g) => {
					should.exist(g);
					g.rounds[g.roundIndex].votes.should.have.property(game.players[0].id).that.equals(vote);
				});
		});

		it('rejects vote from a player who has already voted', () => {
			const player = game.players[_.random(0, players.length-1)];
			const vote = ActionHelper.getRandomBoolean();
			return ActionService.submitTeamVote(game.id, player.id, vote)
				.then(() => {
					return ActionService.submitTeamVote(game.id, player.id, !vote);
				})
				.should.be.rejectedWith(/already voted/);
		});

		it('can only be used during `voting on team` state', () => {
			const player = game.players[_.random(0, players.length-1)];
			return Promise.all(
				_.map(players, (player) => {
					return ActionService.submitTeamVoteApprove(game.id, player.id);
				})
			)
				.then(() => {
					const vote = ActionHelper.getRandomBoolean();
					return ActionService.submitTeamVote(game.id, player.id, vote)
						.should.be.rejectedWith(/`voting on team` state/);
				});
		});

	});


	describe('#submitMissionAction', () => {

		let currentRound;

		beforeEach('Prepare game', () => {
			game = LogicService.startGame(game);
			currentRound = game.rounds[game.roundIndex];
			game = LogicService.selectTeam(game, ActionHelper.getRandomTeam(game, currentRound.teamSize));
			_.each(game.players, (player) => {
				game = LogicService.submitTeamVote(game, player.id, true);
			});
			return GameDB.save(game)
				.then((g) => {
					game = g;
				});
		});


		it('rejects action from player not on the team', () => {
			const playerNotOnTeam = _.find(game.players, (player) => {
				return !LogicService.gameTeamHasPlayerId(game, player.id);
			});
			const action = ActionHelper.getRandomBoolean();
			return ActionService.submitMissionAction(game.id, playerNotOnTeam.id, action)
				.should.be.rejectedWith(/not on the mission team/);
		});

		it('accepts action from a player on the team', () => {
			const currentRound = game.rounds[game.roundIndex];
			const playerOnTeamId = currentRound.team[0];
			const action = ActionHelper.getRandomBoolean();
			return ActionService.submitMissionAction(game.id, playerOnTeamId, action)
				.then((g) => {
					g.rounds[g.roundIndex].mission.should.have.property(playerOnTeamId).that.equals(action);
				});
		});

		it('rejects action from a player who has already acted', () => {
			const currentRound = game.rounds[game.roundIndex];
			const playerOnTeamId = currentRound.team[0];
			const action = ActionHelper.getRandomBoolean();
			return ActionService.submitMissionAction(game.id, playerOnTeamId, action)
				.then(() => {
					return ActionService.submitMissionAction(game.id, playerOnTeamId, !action)
						.should.be.rejectedWith(/already acted/);
				});
		});

		it('can only be used during `executing mission` state', () => {
			const currentRound = game.rounds[game.roundIndex];
			// run the mission and pick a new team
			return Promise.all(
				_.map(currentRound.team, (playerId) => {
					return ActionService.submitMissionSucceed(game.id, playerId);
				})
			)
				.then(() => {
					return GameService.getGame(game.id);
				})
				.then((g) => {
					game = g;
					const currentRound = game.rounds[game.roundIndex];
					const leader = game.players[currentRound.leaderIndex];
					return ActionService.selectTeam(game.id, leader.id, ActionHelper.getRandomTeam(game));
				})
				.then(() => {
					return GameService.getGame(game.id);
				})
				.then((g) => {
					game = g;
					const currentRound = game.rounds[game.roundIndex];
					const playerOnTeamId = currentRound.team[0];
					const action = ActionHelper.getRandomBoolean();
					return ActionService.submitMissionAction(game.id, playerOnTeamId, action)
						.should.be.rejectedWith(/`executing mission` state/);
				});
		});

	});

});
