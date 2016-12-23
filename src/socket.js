'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('socket');
const SocketIO = require('socket.io');

const handler = require('./socket/handler.js');

const createWebSocketServer = (httpServer) => {
	const io = SocketIO(httpServer);
	logger.info('Socket.io attached');

	io.on('connection', (socket) => {
		logger.debug('new socket connection');
		socket.on('message', (message) => {
			logger.debug('incoming message:', message);
			handler.handleMessage(message);
		});
	});
};

module.exports = {
	attachToHttpServer: (httpServer) => {
		return createWebSocketServer(httpServer);
	},
};
