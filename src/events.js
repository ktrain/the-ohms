'use strict';

const logger = require('src/util/logger.js')('events');
const Cache = require('src/util/cache.js');

const subscriptionConnection = Cache.getSubscriptionConnection();

// subscribe to game events
subscriptionConnection.psubscribe(`__keyspace@0__:game-*`);
logger.info('Subscribed to game events');

subscriptionConnection.on('pmessage', (pattern, channel) => {
	logger.debug('[received game pmessage]', pattern, channel);
	const [ , gameId] = channel.match(/__keyspace@\d+__:game-(.*)$/);
	logger.debug('[game ID]', gameId);
});

module.exports = {
	
};
