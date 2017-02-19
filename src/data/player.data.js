'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const config = require('nconf');
const logger = require('src/util/logger.js')('player');

const Cache = require('src/util/cache.js');

const PlayerDB = {

	prepareKey: (id) => {
		return `player-${id}`;
	},

	getKeyPattern: () => {
		return 'player-*';
	},

	prepareNewData: (data) => {
		const newData = _.clone(data);
		newData.id = data.id || uuid.v4();
		return _.pick(newData, ['id', 'name']);
	},

	build: (data) => {
		return PlayerDB.prepareNewData(data);
	},

	create: (data) => {
		const newPlayerData = PlayerDB.prepareNewData(data);
		return PlayerDB.save(newPlayerData);
	},

	markPlayerInGame: (player, gameId) => {
		const playerData = _.assign({}, player, {
			gameId: gameId,
		});
		return PlayerDB.save(playerData);
	},

	markPlayerNoGame: (player) => {
		const playerData = _.omit(player, 'gameId');
		return PlayerDB.save(playerData);
	},

	get: (id) => {
		const key = PlayerDB.prepareKey(id);
		return Cache.get(key);
	},

	save: (player) => {
		const key = PlayerDB.prepareKey(player.id);
		return Cache.put(key, player)
			.then((data) => {
				const expiry = config.get('data:player:expirySeconds');
				logger.trace('expiring player after', expiry);
				return Cache.expire(key, expiry)
					.then(() => {
						return data;
					});
			});
	},

};

module.exports = PlayerDB;
