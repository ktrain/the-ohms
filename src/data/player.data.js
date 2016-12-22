'use strict';

const _ = require('lodash');
const uuid = require('uuid');

const Cache = require('src/util/cache.js');

const PlayerDB = {

	prepareKey: (id) => {
		return `player-${id}`;
	},

	prepareNewData: (data) => {
		data.id = uuid.v4();
		return _.pick(data, ['id', 'name']);
	},

	create: (data) => {
		const newPlayerData = PlayerDB.prepareNewData(_.clone(data));
		const key = PlayerDB.prepareKey(newPlayerData.id);
		return Cache.put(key, newPlayerData)
			.then(() => {
				return newPlayerData;
			});
	},

	get: (id) => {
		const key = PlayerDB.prepareKey(id);
		return Cache.get(key);
	},

};

module.exports = PlayerDB;
