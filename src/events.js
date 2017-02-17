'use strict';

const _ = require('lodash');

const EventEmitter = require('src/util/eventEmitter.js');
const logger = require('src/util/logger.js')('events');

module.exports = {
	setUpSubscriptions: () => {
		// subscribe to game events
		EventEmitter.on('game|save', (gameData) => {
			logger.debug('game|save', gameData);
			// emit an event to each player socket
			_.each(gameData.players, (player) => {
				const clientUpdateEventName = `clientUpdate|${player.id}`;
				logger.trace('emitting clientUpdate event', clientUpdateEventName);
				EventEmitter.emit(clientUpdateEventName, {
					version: 1,
					type: 'clientUpdate',
					payload: gameData,
				});
			});
		});
		logger.info('Subscribed to game events');
	},
};
