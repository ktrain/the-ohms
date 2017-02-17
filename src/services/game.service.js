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

	kickPlayerFromGame: (gameId, playerId) => {
		logger.debug(`Kicking player ${playerId} from game ${gameId}`);
		return GameService.getGame(gameId).then((game) => {
			if (game.players[0].id !== playerId) {
				throw new Error('Only the oldest player in the game can kick a player');
			}
			return GameService.removePlayerFromGame(gameId, playerId);
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


	startGame: (gameId, playerId) => {
		logger.debug(`Starting game ${gameId}`);
		return GameDB.doUnderLock(gameId, (game) => {
			if (!GameService.gameHasPlayerId(game, playerId)) {
				throw new Error(`Player ${player.id} is not in game ${game.id}`);
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
            game.currentRoundIndex = 0;
            game.currentRound = {
                leaderIndex: _.random(0, game.players.length-1),
                team: [],
                votes: {},
                mission: {},
            };

            return GameDB.save(game);
		});
	},

};

module.exports = GameService;
