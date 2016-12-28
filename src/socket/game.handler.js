'use strict';

const GamesService = require('src/services/games.service.js');


const GameHandler = {

	joinGame: (message) => {
		if (!_.isObject(message.payload)) {
			return Promise.reject(new Error('Message requires `payload`, which should be an object.'));
		}
		if (!message.payload.gameId) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

		return GamesService.addPlayerToGame(message.playerId, message.payload.gameId);
	},

	deleteGame: (message) => {
		if (!_.isObject(message.payload)) {
			return Promise.reject(new Error('Message requires `payload`, which should be an object.'));
		}
		if (!message.payload.gameId) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

		return GamesService.deleteGame(message.payload.gameId);
	},

	startGame: (message) => {
		if (!_.isObject(message.payload)) {
			return Promise.reject(new Error('Message requires `payload`, which should be an object.'));
		}
		if (!message.payload.gameId) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

		return GamesService.startGame(message.payload.gameId);
	},

};

module.exports = GameHandler;
