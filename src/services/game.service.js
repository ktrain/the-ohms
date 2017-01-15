'use strict';

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

	leaveGame: (playerId) => {
		return PlayerService.getPlayer(playerId).then((player) => {
			if (!player.gameId) {
				throw new Error(`Player ${player.id} is not in a game.`);
			}
			return GameDB.removePlayer(player.gameId, player.id).then((game) => {
				return PlayerService.markPlayerNoGame(player).then(() => {
					return game;
				});
			});
		});
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
