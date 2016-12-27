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

		return GamesService.joinGame(message.playerId, message.payload.gameId);
	},

	deleteGame: (playerId, payload) => {
		if (!_.isObject(message.payload)) {
			return Promise.reject(new Error('Message requires `payload`, which should be an object.'));
		}
		if (!message.payload.gameId) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

	},

	startGame: (playerId, payload) => {
		if (!_.isObject(message.payload)) {
			return Promise.reject(new Error('Message requires `payload`, which should be an object.'));
		}
		if (!message.payload.gameId) {
			return Promise.reject(new Error('Message requires `payload.gameId`.'));
		}

	},

};

module.exports = GameHandler;
