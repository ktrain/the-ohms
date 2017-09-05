'use strict';

const logger = require('src/util/logger.js')('socketHandler');

const EventEmitter = require('src/util/eventEmitter.js');
const GameHandler = require('./game.handler.js');
const GameService = require('src/services/game.service.js');


const Handler = {

	handleNewConnection: (socket) => {
		const playerId = socket.request._query.playerId;
		if (!playerId) {
			return Promise.reject(new Error('Socket connection requires query option `playerId`.'));
		}
		const gameId = socket.request._query.gameId;

		let game;

		return Promise.resolve().then(() => {
			if (!gameId) {
				logger.debug('No game ID specified; creating new game');
				return GameService.createGame();
			}
			return GameService.getGame(gameId)
				.then((g) => {
					if (!g) {
						throw new Error(`Specified game does not exist: ${gameId}`);
					}
					return g;
				});
		})
			.then((g) => {
				game = g;
				return Promise.all([
					Handler.bindOutgoingMessageHandler(socket, playerId),
					Handler.bindIncomingMessageHandler(socket, playerId, game.id),
				]);
			})
			.then(() => {
				logger.debug('Adding player connection to game', game.id);
				return GameService.addPlayerToGame(game.id, playerId);
			})
			.catch((err) => {
				if (game && game.players.length === 0) {
					GameService.deleteGame(game.id);
				}
				throw err;
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

	bindIncomingMessageHandler: (socket, playerId, gameId) => {
		socket.on('message', (message) => {
			if (message.version !== 1) {
				logger.error(new Error(`Message must specify a message protocol version. Supported version: 1.`));
				return;
			}

			message.playerId = playerId;
			message.gameId = gameId;
			logger.debug('incoming message:', message);
			Handler.handleIncomingMessage(message)
				.catch((err) => {
					logger.error(err);
					socket.emit('messageError', err);
				});
		});
	},

	handleIncomingMessage: (message) => {
		return GameHandler.handleMessage(message);
	},

};

module.exports = Handler;
