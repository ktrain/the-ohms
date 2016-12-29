'use strict';

const GameHandler = require('./game.handler.js');
const EventEmitter = require('src/util/eventEmitter.js');


const Handler = {

	handleNewConnection: (socket) => {
		const playerId = socket.request.query.playerId;
		// bind outgoing message handler
		EventEmitter.on(`clientUpdate|${playerId}`, (event) => {
			socket.emit(event.type, event);
		});
	},

	handleMessage: (message) => {
		return new Promise((resolve, reject) => {
			let parsedMessage;
			try {
				parsedMessage = JSON.parse(message);
			} catch (err) {
				return reject(new Error(`Could not JSON.parse incoming message: ${message}`));
			}

			if (parsedMessage.version !== 1) {
				return reject(new Error(`Message must specify a version. Supported version: 1.`));
			}

			if (!parsedMessage.type) {
				return reject(new Error(`Incoming message has no type: ${message}`));
			}

			if (!parsedMessage.playerId) {
				return reject(new Error(`Incoming message has no playerId: ${message}`));
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

			return reject(new Error(`Incoming message has unknown type: ${message}`));
		});
	},

};

module.exports = Handler;
