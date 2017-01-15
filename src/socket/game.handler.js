'use strict';

const _ = require('lodash');

const GamesService = require('src/services/games.service.js');


const GameHandler = {

	joinGame: (message) => {
		if (!_.get(message, 'payload.gameId')) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

		return GamesService.addPlayerToGame(message.playerId, message.payload.gameId);
	},

	leaveGame: (message) => {
		return GamesService.leaveGame(message.playerId);
	},

	startGame: (message) => {
		return GamesService.startGame(message.playerId);
	},

};

module.exports = GameHandler;
