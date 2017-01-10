'use strict';

const GameHandler = require('./game.handler.js');


const Handler = {

	handleMessage: (parsedMessage) => {
		return new Promise((resolve, reject) => {
			if (!parsedMessage.type) {
				return reject(new Error(`Incoming message has no type: ${parsedMessage}`));
			}

			if (!parsedMessage.playerId) {
				return reject(new Error(`Incoming message has no playerId: ${parsedMessage}`));
			}

			switch (parsedMessage.type) {
				case 'joinGame':
					return GameHandler.joinGame(parsedMessage);
				case 'startGame':
					return GameHandler.startGame(parsedMessage);
				case 'deleteGame':
					return GameHandler.deleteGame(parsedMessage);
				case 'selectTeam':
					break;
				case 'approveTeam':
					break;
				case 'rejectTeam':
					break;
				case 'succeedMisson':
					break;
				case 'failMission':
					break;
			}

			return reject(new Error(`Incoming message has unknown type: ${parsedMessage}`));
		});
	},

};

module.exports = Handler;
