'use strict';

const GameDB = require('src/data/game.data.js');
const PlayersService = require('src/services/players.service.js');

const GamesService = {

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
		return PlayersService.getPlayer(playerId).then((player) => {
			if (!player) {
				throw new Error(`Player does not exist (ID ${playerId})`);
			}
			return GameDB.addPlayer(gameId, player);
		});
	},

	deleteGame: (gameId) => {
		return GamesService.getGame(gameId)
			.then((game) => {
				return game.delete();
			});
	},

	checkGameHasPlayerId: (game, playerId) => {
		return GameDB.hasPlayer(game, playerId);
	},

	startGame: (gameId, playerId) => {
		return GameDB.startGame(gameId, playerId);
	},

};

module.exports = GamesService;
