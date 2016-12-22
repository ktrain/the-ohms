'use strict'

const _ = require('lodash');
const uuid = require('uuid');

const Cache = require('src/util/cache.js');

const GameDB = {

	prepareKey: (id) => {
		return `game-${id}`;
	},

	prepareNewData: (data) => {
		data.id = uuid.v4();
		return _.pick(data, ['id', 'name']);
	},

	create: (data) => {
		const newGameData = GameDB.prepareNewData(_.clone(data));
		const key = GameDB.prepareKey(newGameData.id);
		return Cache.put(key, newGameData)
			.then(() => {
				return newGameData;
			});
	},

	get: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.get(key);
	},

};

module.exports = GameDB;
