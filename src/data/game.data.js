'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const generateName = require('adjective-adjective-animal');
const config = require('nconf');

const logger = require('src/util/logger.js')('game');
const EventEmitter = require('src/util/eventEmitter.js');
const Cache = require('src/util/cache.js');

const PlayerDB = require('./player.data.js');
const GameSetup = require('./game.setup.js');

const GameDB = {

	prepareKey: (id) => {
		return `game-${id}`;
	},

	getKeyPattern: () => {
		return 'game-*';
	},

	prepareNewData: () => {
		return generateName({
			adjectives: 1,
			format: 'lower',
		}).then((name) => {
			return {
				id: uuid.v4(),
				name: name,
				state: 'waiting for players',
				players: [],
				numSuccesses: 0,
				numFails: 0,
			};
		});
	},

	create: () => {
		return GameDB.build()
			.then((game) => {
				return GameDB.save(game);
			});
	},

	build: () => {
		return GameDB.prepareNewData();
	},

	save: (game) => {
		if (!game.id) {
			return Promise.reject(new Error('Game to save has no ID.'));
		}
		const key = GameDB.prepareKey(game.id);
		return Cache.put(key, game)
			.then((game) => {
				EventEmitter.emit('game|save', game);
				const expiry = config.get('data:game:expirySeconds');
				logger.trace('expiring game after', expiry);
				return Cache.expire(key, expiry)
					.then(() => {
						return game;
					});
			});
	},

	get: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.get(key);
	},

	getAll: () => {
		return Cache.keys(GameDB.getKeyPattern())
			.then((keys) => {
				logger.debug('keys', keys);
				return Cache.getAll(keys);
			});
	},

	destroy: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.del(key)
			.then(() => {
				return null;
			});
	},

	doUnderLock: (id, doTheWork) => {
		const key = GameDB.prepareKey(id);

		return Cache.acquireLock(key).then((lock) => {
			return GameDB.get(id)
				.then((game) => {
					if (!game) {
						throw new Error(`Game ${id} does not exist`);
					}
					return game;
				})
				.then(doTheWork)
				.catch((err) => {
					lock.unlock();
					throw err;
				}).then((res) => {
					lock.unlock();
					return res;
				});
		});
	},

};

module.exports = GameDB;
