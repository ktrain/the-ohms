'use strict';

const GamesDB = require('src/data/game.data.js');
const GameModel = require('src/data/game.model.js');
const PlayersService = require('src/services/players.service.js');

const GamesService = {

	createGame: () => {
		return GamesDB.create()
			.then((gameData) => {
				return GameModel.initialize(gameData);
			});
	},

	getGame: (gameId) => {
		return GamesDB.get(gameId)
			.then((gameData) => {
				if (!gameData) {
					return null;
				}
				return GameModel.initialize(gameData);
			});
	},

	addPlayerToGame: (playerId, gameId) => {
		return Promise.all([
			GamesService.getGame(gameId),
			PlayersService.getPlayer(playerId),
		]).then(([game, player]) => {
			if (!game) {
				throw new Error(`Game does not exist (ID ${gameId})`);
			}
			if (!player) {
				throw new Error(`Player does not exist (ID ${playerId})`);
			}
			return game.addPlayer(player);
		});
	},

	deleteGame: (gameId) => {
		// TODO: update clients with a gameDeleted message
		return GamesDB.destroy(gameId);
	},

	startGame: (gameId) => {
		return GamesService.getGame(gameId)
			.then((game) => {
				return game.start();
			});
	},

};

module.exports = GamesService;
