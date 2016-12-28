'use strict';

const logger = require('src/util/logger.js')('events');
const Cache = require('src/util/cache.js');

const subscriptionConnection = Cache.getSubscriptionConnection();

// subscribe to game events
subscriptionConnection.psubscribe(`__keyspace@0__:game-*`);

subscriptionConnection.on('pmessage', (channel, message) => {
	logger.debug('received game pmessage', channel, message);
	switch (message) {
		case 'set':
			// inform clients of a change to the game
			break;
		case 'del':
			// inform clients that the game has been deleted
			break;
	}
});

