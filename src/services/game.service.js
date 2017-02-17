'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('gameService');
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

	gameHasPlayerId: (game, playerId) => {
		return !!_.find(game.players, (player) => { return playerId === player.id; });
	},

	addPlayerToGame: (gameId, playerId) => {
		return PlayerService.getPlayer(playerId).then((player) => {
			if (!player) {
				throw new Error(`Player does not exist (ID ${playerId})`);
			}
			if (player.gameId && player.gameId !== gameId) {
				throw new Error(`Player is already in another game ${player.gameId}`);
			}
			return GameDB.addPlayer(gameId, player).then((game) => {
				return PlayerService.markPlayerInGame(player, gameId).then(() => {
					return game;
				});
			});
		});
	},

	kickPlayerFromGame: (gameId, playerId) => {
		return GameService.getGame(gameId)
			.then((game) => {
				if (game.players[0].id !== playerId) {
					throw new Error('Only the oldest player in the game can kick a player.');
				}
				logger.debug(`Kicking player ${playerId} from game ${gameId}`);
				return GameService.removePlayerFromGame(gameId, playerId);
			});
	},

	removePlayerFromGame: (gameId, playerId) => {
		logger.debug(`Removing player ${playerId} from game ${gameId}`);
		return GameDB.removePlayer(gameId, playerId)
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
		return GameService.getGame(gameId)
			.then((game) => {
				if (!GameService.gameHasPlayerId(game, playerId)) {
					throw new Error(`Player ${player.id} is not in game ${game.id}`);
				}
				return GameDB.startGame(game.id);
			});
	},

};

module.exports = GameService;
