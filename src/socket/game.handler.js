'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('gameHandler');

const GameService = require('src/services/game.service.js');


const GameHandler = {

	handleMessage: (message) => {
		if (!message.type) {
			return Promise.reject(new Error(`Incoming message has no type: ${JSON.stringify(message)}`));
		}

		if (!message.playerId) {
			return Promise.reject(new Error(`Incoming message has no playerId: ${JSON.stringify(message)}`));
		}

		switch (message.type) {
			case 'leaveGame':
				return GameHandler.leaveGame(message);
			case 'kickPlayer':
				return GameHandler.kickPlayer(message);
			case 'startGame':
				return GameHandler.startGame(message);
			case 'selectTeam':
				return GameHandler.selectTeam(message);
			case 'approveTeam':
				return GameHandler.approveTeam(message);
			case 'rejectTeam':
				return GameHandler.rejectTeam(message);
			case 'succeedMisson':
				return GameHandler.succeedMission(message);
			case 'failMission':
				return GameHandler.failMission(message);
		}

		return reject(new Error(`Incoming message has unknown type: ${JSON.stringify(message)}`));
	},

	leaveGame: (message) => {
		return GameService.removePlayerFromGame(message.gameId, message.playerId);
	},

	kickPlayer: (message) => {
		return GameService.kickPlayerFromGame(message.gameId, message.playerId);
	},

	startGame: (message) => {
		return GameService.startGame(message.gameId, message.playerId);
	},

	selectTeam: (message) => {
		if (!_.isArray(_.get(message, 'payload.team'))) {
			return Promise.reject(new Error('`selectTeam` message requires `payload.team` (array)'));
		}
		return GameService.selectTeam(message.gameId, message.playerId, message.payload.team);
	},

	approveTeam: (message) => {
		return GameService.approveTeam(message.gameId, message.playerId);
	},

	rejectTeam: (message) => {
		return GameService.rejectTeam(message.gameId, message.playerId);
	},

	succeedMission: (message) => {
		return GameService.succeedMission(message.gameId, message.playerId);
	},

	failMission: (message) => {
		return GameService.failMission(message.gameId, message.playerId);
	},

};

module.exports = GameHandler;
