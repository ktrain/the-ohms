'use strict';

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

	addPlayerToGame: (playerId, gameId) => {
		return PlayerService.getPlayer(playerId).then((player) => {
			if (!player) {
				throw new Error(`Player does not exist (ID ${playerId})`);
			}
			return GameDB.addPlayer(gameId, player).then((game) => {
				return PlayerService.markPlayerInGame(player, gameId).then(() => {
					return game;
				});
			});
		});
	},

	removePlayerFromGame: (gameId, playerId) => {
		let game;
		logger.debug(`Removing player ${playerId} from game ${gameId}`);
		return GameDB.removePlayer(gameId, playerId)
			.then((g) => {
				game = g;
				return PlayerService.getPlayer(playerId);
			})
			.then((player) => {
				if (player) {
					return PlayerService.markPlayerNoGame(player);
				}
			})
			.then(() => {
				return game;
			});
	},

	deleteGame: (gameId) => {
		return GameDB.destroy(gameId);
	},

	checkGameHasPlayerId: (game, playerId) => {
		return GameDB.hasPlayer(game, playerId);
	},

	startGame: (playerId) => {
		return PlayerService.getPlayer(playerId).then((player) => {
			if (!player.gameId) {
				throw new Error(`Player ${player.id} is not in a game.`);
			}
			return GameDB.startGame(player.gameId);
		});
	},

};

module.exports = GameService;
