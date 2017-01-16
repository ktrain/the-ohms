'use strict';

const logger = require('src/util/logger.js')('socketHandler');

const EventEmitter = require('src/util/eventEmitter.js');
const GameHandler = require('./game.handler.js');
const GameService = require('src/services/game.service.js');
const PlayerService = require('src/services/player.service.js');


const Handler = {

	handleNewConnection: (socket) => {
		const playerId = socket.request._query.playerId;
		if (!playerId) {
			return Promise.reject(new Error('Socket connection requires query option `playerId`.'));
		}
		const gameId = socket.request._query.gameId;

		return Promise.resolve().then(() => {
			if (!gameId) {
				logger.debug('No game ID specified; creating new game');
				return GameService.createGame();
			}
			return GameService.getGame(gameId);
		}).then(() => {
			return Promise.all([
				Handler.bindOutgoingMessageHandler(socket, playerId),
				Handler.bindIncomingMessageHandler(socket, playerId),
			]);
		}).then((game) => {
			logger.debug('Adding player connection to game', gameId);
			return GameService.addPlayerToGame(playerId, gameId)
			// TODO: check if the error is because the player is already in the game and ignore if so
		});
	},

	bindOutgoingMessageHandler: (socket, playerId) => {
		const clientUpdateEventName = `clientUpdate|${playerId}`;
		logger.info('Binding client update listener', clientUpdateEventName);
		EventEmitter.on(clientUpdateEventName, (event) => {
			logger.trace('clientUpdate event', JSON.stringify(event, null, '  '));
			socket.emit(event.type, event);
		});
	},

	bindIncomingMessageHandler: (socket, playerId) => {
		socket.on('message', (message) => {
			let parsedMessage;
			try {
				parsedMessage = JSON.parse(message);
			} catch(err) {
				throw new Error(`Could not JSON.parse incoming message: ${message}`);
			}

			if (parsedMessage.version !== 1) {
				throw new Error(`Message must specify a message protocol version. Supported version: 1.`);
			}

			parsedMessage.playerId = playerId;
			logger.debug('incoming message:', parsedMessage);
			Handler.handleMessage(parsedMessage)
				.catch((err) => {
					logger.error(err);
					socket.emit('messageError', err);
				});
		});
	},

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
