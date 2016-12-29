'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('socket');
const SocketIO = require('socket.io');

const EventEmitter = require('src/util/eventEmitter.js');
const ClientUpdater = require('./socket/clientUpdater.js');
const Handler = require('./socket/handler.js');

module.exports = {
	attachToHttpServer: (httpServer) => {
		const io = SocketIO(httpServer);

		io.use((socket, next) => {
			logger.debug('handling new connection');
			// bind outgoing message handler
			try {
				Handler.handleNewConnection(socket);
			} catch (e) {
				return next(e);
			}

			// bind incoming message handler
			socket.on('message', (message) => {
				logger.debug('incoming message:', message);
				Handler.handleMessage(message);
			});
			next();
		});
		logger.info('Socket.io attached');
	},
};
