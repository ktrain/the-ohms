'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('socket');
const SocketIO = require('socket.io');

const EventEmitter = require('src/util/eventEmitter.js');
const Handler = require('./socket/handler.js');

module.exports = {
	attachToHttpServer: (httpServer) => {
		const io = SocketIO(httpServer);

		io.use((socket, next) => {
			logger.debug('handling new connection');

			const playerId = socket.request._query.playerId;
			if (!playerId) {
				return next(new Error('Socket connection requires query option `playerId`.'));
			}

			// bind outgoing message handler
			const clientUpdateEventName = `clientUpdate|${playerId}`;
			logger.info('Binding client update listener', clientUpdateEventName);
			EventEmitter.on(clientUpdateEventName, (event) => {
				logger.trace('clientUpdate event', JSON.stringify(event, null, '  '));
				socket.emit(event.type, event);
			});

			// bind incoming message handler
			socket.on('message', (message) => {
				let parsedMessage;
				try {
					parsedMessage = JSON.parse(message);
				} catch (err) {
					throw new Error(`Could not JSON.parse incoming message: ${message}`);
				}

				if (parsedMessage.version !== 1) {
					throw new Error(`Message must specify a message protocol version. Supported version: 1.`);
				}

				parsedMessage.playerId = playerId;
				logger.debug('incoming message:', parsedMessage);
				Handler.handleMessage(parsedMessage)
					.catch((e) => {
						logger.error(e);
						socket.emit('messageError', e);
					});
			});

			next();
		});
		logger.info('Socket.io attached');
	},
};
