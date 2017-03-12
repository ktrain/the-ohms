'use strict';

const socketClient = require('socket.io-client');
const _ = require('lodash');

const Logger = require('data/logger');

let client;


const Messenger = {

	connect: (url, query, handler, errorHandler) => {
		Logger.info('Messenger connecting');
		client = socketClient(url, query);
		client.on('error', errorHandler);
		client.on('clientUpdate', handler);
		return Messenger;
	},

	send: (type, payload) => {
		const message = _.assign({ type, payload }, { version: 1 });
		Logger.debug('sending', message);
		client.emit('message', message);
		return Messenger;
	},

};

module.exports = Messenger;
