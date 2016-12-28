'use strict'

const _ = require('lodash');
const uuid = require('uuid');
const generateName = require('adjective-adjective-animal');

const Cache = require('src/util/cache.js');

const GameDB = {

	prepareKey: (id) => {
		return `game-${id}`;
	},

	prepareNewData: (data = {}) => {
		return generateName({
			adjectives: 1,
			format: 'lower',
		}).then((name) => {
			data.id = uuid.v4();
			data.name = name;
			return _.pick(data, ['id', 'name']);
		});
	},

	create: (data = {}) => {
		return GameDB.prepareNewData(_.clone(data))
			.then((newGameData) => {
				return GameDB.save(newGameData);
			});
	},

	save: (gameData) => {
		if (!gameData.id) {
			return Promise.reject(new Error('Game to save has no ID.'));
		}
		const key = GameDB.prepareKey(gameData.id);
		return Cache.put(key, gameData);
	},

	get: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.get(key);
	},

	destroy: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.del(key);
	},

};

module.exports = GameDB;
