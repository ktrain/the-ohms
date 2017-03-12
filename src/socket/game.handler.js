'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('gameHandler');

const ActionService = require('src/services/action.service.js');


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
			case 'succeedMission':
				return GameHandler.succeedMission(message);
			case 'failMission':
				return GameHandler.failMission(message);
		}

		return Promise.reject(new Error(`Incoming message has unknown type: ${JSON.stringify(message)}`));
	},

	leaveGame: (message) => {
		return ActionService.leaveGame(message.gameId, message.playerId);
	},

	kickPlayer: (message) => {
		if (!_.get(message, 'payload.playerId')) {
			return Promise.reject(new Error('`kickPlayer` message requires `payload.playerId` (string)'));
		}
		return ActionService.kickPlayerFromGame(message.gameId, message.playerId, message.payload.playerId);
	},

	startGame: (message) => {
		return ActionService.startGame(message.gameId, message.playerId);
	},

	selectTeam: (message) => {
		if (!_.isArray(_.get(message, 'payload.team'))) {
			return Promise.reject(new Error('`selectTeam` message requires `payload.team` (array)'));
		}
		return ActionService.selectTeam(message.gameId, message.playerId, message.payload.team);
	},

	approveTeam: (message) => {
		return ActionService.submitTeamVoteApprove(message.gameId, message.playerId);
	},

	rejectTeam: (message) => {
		return ActionService.submitTeamVoteReject(message.gameId, message.playerId);
	},

	succeedMission: (message) => {
		return ActionService.submitMissionSucceed(message.gameId, message.playerId);
	},

	failMission: (message) => {
		return ActionService.submitMissionFail(message.gameId, message.playerId);
	},

};

module.exports = GameHandler;
