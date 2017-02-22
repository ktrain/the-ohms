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
