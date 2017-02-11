'use strict';

const _ = require('lodash');

const GameService = require('src/services/game.service.js');


const GameHandler = {

	leaveGame: (message) => {
		return GameService.removePlayerFromGame(message.playerId, message.gameId);
	},

	startGame: (message) => {
		return GameService.startGame(message.playerId);
	},

};

module.exports = GameHandler;
