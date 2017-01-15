'use strict';

const _ = require('lodash');

const GameService = require('src/services/game.service.js');
const GameDB = require('src/data/game.data.js');
const Cache = require('src/util/cache.js');

const GameHelper = {

	createGame: () => {
		return GameService.createGame();
	},

	getAllGames: () => {
		return GameDB.getAll();
	},

	clearGames: () => {
		return Cache
			.keys(GameDB.getKeyPattern())
			.then((keys) => {
				return Promise.all(
					_.map(keys, (key) => {
						return Cache.del(key);
					})
				);
			});
	},

};

module.exports = GameHelper;
