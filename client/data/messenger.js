'use strict';

const socketClient = require('socket.io-client');
const _ = require('lodash');

let client;


const Messenger = {

	connect: (url, query, handler) => {
		console.log('messenger connecting');
		client = socketClient(url, query);
		client.on('clientUpdate', handler);
		return Messenger;
	},

	send: (type, payload) => {
		const message = _.assign({ type, payload }, { version: 1 });
		console.log('sending', message);
		client.emit('message', message);
		return Messenger;
	},

};

module.exports = Messenger;
