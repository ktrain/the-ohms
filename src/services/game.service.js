'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('gameService');

const GameSetup = require('src/data/game.setup.js');
const GameDB = require('src/data/game.data.js');
const PlayerService = require('src/services/player.service.js');

const GameService = {

	createGame: () => {
		return GameDB.create();
	},

	getGame: (gameId) => {
		return GameDB.get(gameId);
	},

	getAllGames: () => {
		return GameDB.getAll();
	},

	deleteGame: (gameId) => {
		return GameDB.destroy(gameId);
	},

	getPlayerIndex: (game, playerId) => {
		return _.findIndex(game.players, (player) => { return playerId === player.id; });
	},

	gameHasPlayerId: (game, playerId) => {
		return (GameService.getPlayerIndex(game, playerId) >= 0);
	},

	gameTeamHasPlayerId: (game, playerId) => {
		return !!_.find(game.rounds[game.roundIndex].team, playerId);
	},

	addPlayerToGame: (gameId, playerId) => {
		return PlayerService.getPlayer(playerId).then((player) => {
			if (!player) {
				throw new Error(`Player ${playerId} does not exist`);
			}
			if (player.gameId && player.gameId !== gameId) {
				throw new Error(`Player is already in another game ${player.gameId}`);
			}

			return GameDB.doUnderLock(gameId, (game) => {
				const playerIndex = GameService.getPlayerIndex(game, playerId);
				if (playerIndex >= 0) {
					// player is already in this game
					return GameDB.save(game);
				}

				if (game.state !== 'waiting for players') {
					throw new Error(`Game ${gameId} has already started`);
				}

				if (game.players.length >= GameSetup.getMaxNumPlayers()) {
					throw new Error(`Game ${gameId} is full`);
				}

				game.players.push(player);
				logger.debug('PLAYER ADDED');

				return GameDB.save(game);
			})
			.then((game) => {
				return PlayerService.markPlayerInGame(player, gameId).then(() => {
					return game;
				});
			});
		});
	},

	removePlayerFromGame: (gameId, playerId) => {
		logger.debug(`Removing player ${playerId} from game ${gameId}`);
		return GameDB.doUnderLock(gameId, (game) => {
			if (game.state !== 'waiting for players') {
				throw new Error('Players cannot be kicked once a game has started');
			}

			game.players = _.filter(game.players, (player) => {
				return player.id !== playerId;
			});

			if (game.players.length === 0) {
				logger.debug('game is empty; destroying', gameId);
				return GameDB.destroy(gameId);
			}

			return GameDB.save(game);
		})
		.then((game) => {
			return PlayerService.getPlayer(playerId)
				.then((player) => {
					return PlayerService.markPlayerNoGame(player);
				})
				.then(() => {
					return game;
				});
		});
	},

	PlayerActions: {

		kickPlayerFromGame: (gameId, playerId) => {
			logger.debug(`Kicking player ${playerId} from game ${gameId}`);
			return GameService.getGame(gameId).then((game) => {
				if (game.players[0].id !== playerId) {
					throw new Error('Players can only be kicked by the player who least recently joined the game');
				}
				return GameService.removePlayerFromGame(gameId, playerId);
			});
		},

		startGame: (gameId, playerId) => {
			logger.debug(`Starting game ${gameId}`);
			return GameDB.doUnderLock(gameId, (game) => {
				if (game.players[0].id !== playerId ) {
					throw new Error('Game can only be started by the player who least recently joined the game');
				}

				if (game.state !== 'waiting for players') {
					throw new Error(`Game ${gameId} has already started`);
				}

				if (game.players.length < GameSetup.getMinNumPlayers()) {
					throw new Error(`Cannot start game ${gameId} without at least ${GameSetup.getMinNumPlayers()} players`);
				}

				game.state = 'selecting team';

				const setup = GameSetup.getGameSetupByNumPlayers(game.players.length);
				game.spyIndices = _.sampleSize(_.range(0, game.players.length), setup.numSpies);
				game.spyIndices.sort();
				game.rounds = setup.rounds;
				game.roundIndex = 0;
				game.rounds[game.roundIndex].leaderIndex = _.random(0, game.players.length-1);

				return GameDB.save(game);
			});
		},

		selectTeam: (gameId, playerId, team) => {
			return GameDB.doUnderLock(gameId, (game) => {
				const currentRound = game.rounds[game.roundIndex];
				const leaderIndex = currentRound.leaderIndex;
				if (game.players[leaderIndex].id !== playerId) {
					throw new Error('Only the round leader can select a team');
				}

				if (game.state !== 'selecting team') {
					throw new Error('A team can only be selected when the game is in `selecting team` state');
				}

				const expectedTeamSize = currentRound.teamSize;
				if (team.length !== expectedTeamSize) {
					throw new Error(`Invalid team: must have ${expectedTeamSize} players this round`);
				}

				_.each(team, (playerId) => {
					const playerIndex = GameService.getPlayerIndex(game, playerId);
					if (playerIndex < 0) {
						throw new Error(`Invalid team: player ${playerId} is not in the game`);
					}
				});

				currentRound.team = team;
				game.state = 'voting on team';

				return GameDB.save(game);
			});
		},

		submitTeamVote: (gameId, playerId, vote) => {
			return GameDB.doUnderLock(gameId, (game) => {
				if (!GameService.gameHasPlayerId(game, playerId)) {
					throw new Error(`Player ${playerId} is not in game {gameId}`);
				}

				if (game.state !== 'voting on team') {
					throw new Error('A team can only be approved when the game is in `voting on team` state');
				}

				game.rounds[game.roundIndex].votes[playerId] = !!vote;
				GameService.tallyTeamVotes(game);

				return GameDB.save(game);
			});
		},

		submitTeamVoteApprove: (gameId, playerId) => {
			return GameService.PlayerActions.submitTeamVote(gameId, playerId, true);
		},

		submitTeamVoteReject: (gameId, playerId) => {
			return GameService.PlayerActions.submitTeamVote(gameId, playerId, false);
		},

		submitMissionAction: (gameId, playerId, action) => {
			return GameDB.doUnderLock(gameId, (game) => {
				if (!GameService.gameTeamHasPlayerId(game, playerId)) {
					throw new Error('Only players on the mission team can submit a mission action');
				}

				if (game.state !== 'executing mission') {
					throw new Error('A mission action can only be submitted when the game is in `executing mission` state');
				}

				game.rounds[game.roundIndex].mission[playerId] = !!action;
				GameService.tallyMissionActions(game);

				return GameDB.save(game);
			});
		},

		submitMissionSucceed: (gameId, playerId) => {
			return GameService.PlayerActions.submitMissionAction(true);
		},

		submitMissionFail: (gameId, playerId) => {
			return GameService.PlayerActions.submitMissionAction(false);
		},

	},

	// mutates game and returns it
	tallyTeamVotes: (game) => {
		const currentRound = game.rounds[game.roundIndex];
		const voteValues = _.values(currentRound.votes);

		if (voteValues.length < game.players.length) {
			// voting is incomplete
			return game;
		}

		// group votes by value
		const votes = _.groupBy(voteValues);
		logger.debug('voting complete', votes);

		if (votes[true].length > votes[false].length) {
			// team approved
			game.state = 'executing mission';
		} else {
			// team rejected
			// reset the round and increment the number of rejections
			currentRound.numRejections++;
			if (currentRound.numRejections >= 5) {
				game.state = 'spies win';
			} else {
				currentRound.leaderIndex = (currentRound.leaderIndex + 1) % game.players.length;
				game.state = 'selecting team';
			}
		}

		return game;
	},

	// mutates game and returns it
	tallyMissionActions: (game) => {
		const currentRound = game.rounds[game.roundIndex];
		const missionValues = _.values(currentRound.mission);

		if (missionValues.length < currentRound.team.length) {
			// mission is incomplete
			return game;
		}

		// group mission actions by value
		const mission = _.groupBy(missionValues);
		logger.debug('mission complete', mission);

		if (mission[false].length < currentRound.numFailsRequired) {
			game.numSuccesses++;
		} else {
			game.numFails++;
		}

		GameService.tallyRoundResults(game);

		// check whether the game is over
		if (game.state === 'executing mission') {
			game.state = 'selecting team';
			game.roundIndex++;
		}

		return game;
	},

	// mutates game and returns it
	tallyRoundResults: (game) => {
		if (game.numSuccesses >= 3) {
			// ohms win
			game.state = 'ohms win';
		} else if (game.numFails >= 3) {
			// spies win
			game.state = 'spies win';
		}

		return game;
	},

};

module.exports = GameService;
