'use strict';

const logger = require('src/util/logger.js')('wss');
const WebSocketServer = require('ws').Server;

const createWebSocketServer = (httpServer) => {
	const wss = new WebSocketServer({ server: httpServer });
	logger.info('WebSocketServer attached');

	wss.on('connection', (ws) => {
		logger.debug('new ws connection');
		ws.on('message', (message) => {
			logger.debug('incoming message:', message);
		});
		// TODO: attach handlers here
	});
};

module.exports = {
	attachToHttpServer: (httpServer) => {
		return createWebSocketServer(httpServer);
	},
};
