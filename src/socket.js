'use strict';

const logger = require('src/util/logger.js')('socket');
const SocketIO = require('socket.io');

const Handler = require('./socket/handler.js');

module.exports = {
	attachToHttpServer: (httpServer) => {
		const io = SocketIO(httpServer);

		io.use((socket, next) => {
			logger.debug('handling new connection');

			return Handler.handleNewConnection(socket)
				.then(() => {
					next();
				})
				.catch((err) => {
					logger.error(err);
					next(err);
				});
		});

		logger.info('Socket.io attached');
	},
};
