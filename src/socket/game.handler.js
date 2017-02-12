'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('gameHandler');

const GameService = require('src/services/game.service.js');


const GameHandler = {

	leaveGame: (message) => {
		return GameService.removePlayerFromGame(message.gameId, message.playerId);
	},

	kickPlayer: (message) => {
		return GameService.getGame(message.gameId)
			.then((game) => {
				if (game.players[0].id !== message.playerId) {
					throw new Error('Only the game leader can kick a player.');
				}
				logger.debug(`Kicking player ${message.payload.playerId} from game ${message.gameId}`);
				return GameService.removePlayerFromGame(message.gameId, message.payload.playerId);
			});
	},

	startGame: (message) => {
		return GameService.startGame(message.playerId);
	},

};

module.exports = GameHandler;
