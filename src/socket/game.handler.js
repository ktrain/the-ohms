'use strict';

const _ = require('lodash');

const GameService = require('src/services/game.service.js');


const GameHandler = {

	joinGame: (message) => {
		if (!_.get(message, 'payload.gameId')) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

		return GameService.addPlayerToGame(message.playerId, message.payload.gameId);
	},

	leaveGame: (message) => {
		return GameService.leaveGame(message.playerId);
	},

	startGame: (message) => {
		return GameService.startGame(message.playerId);
	},

};

module.exports = GameHandler;
