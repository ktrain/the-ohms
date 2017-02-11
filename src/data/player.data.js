'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const config = require('nconf');

const Cache = require('src/util/cache.js');

const PlayerDB = {

	prepareKey: (id) => {
		return `player-${id}`;
	},

	prepareNewData: (data) => {
		const newData = _.clone(data);
		newData.id = uuid.v4();
		return _.pick(newData, ['id', 'name']);
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
			/*.then((data) => {
				return Cache.expire(key, config.get('data:player:inactivityExpirySeconds'))
					.then(() => {
						return data;
					});
			})*/;
	},

};

module.exports = PlayerDB;
