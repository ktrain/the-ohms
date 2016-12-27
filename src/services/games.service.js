'use strict';

const GamesDB = require('src/data/game.data.js');
const GameModel = require('src/data/game.model.js');

const GamesService = {

	createGame: () => {
		return GamesDB.create();
	},

	getGame: (gameId) => {
		return GamesDB.get(gameId)
			.then((gameData) => {
				return GameModel.initialize(gameData);
			});
	},

	joinGame: (playerId, gameId) => {
		return GamesDB.get(gameId)
			.then((game) => {
				if (!game) {
					throw new Error(`Game does not exist (ID ${gameId})`);
				}
				/*if (!game.isAwaitingl
					throw new Error(`G
				}*/
			});
	},

};

module.exports = GamesService;
