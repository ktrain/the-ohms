'use strict';

const _ = require('lodash');

const EventEmitter = require('src/util/eventEmitter.js');
const logger = require('src/util/logger.js')('events');

const PlayerService = require('src/services/player.service.js');


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

		EventEmitter.on('game|playerJoin', (gameData, playerId) => {
			logger.debug('game|playerJoin', gameData, playerId);
			// mark the player as being in the game
			PlayerService.getPlayer(playerId)
				.then((player) => {
					return PlayerService.markPlayerInGame(player, gameData.id);
				});
		});

		EventEmitter.on('game|playerLeave', (gameData, playerId) => {
			logger.debug('game|playerLeave', gameData, playerId);
			// mark the player as being in no game
			PlayerService.getPlayer(playerId)
				.then((player) => {
					return PlayerService.markPlayerNoGame(player);
				});
		});

		logger.info('Subscribed to game events');
	},
};
