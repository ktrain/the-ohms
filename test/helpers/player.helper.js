'use strict';

const _ = require('lodash');
const randomstring = require('randomstring');

const PlayerService = require('src/services/player.service.js');
const PlayerDB = require('src/data/player.data.js');
const Cache = require('src/util/cache.js');


const PlayerHelper = {

	createPlayer: () => {
		return PlayerService.createPlayer({
			name: randomstring.generate({
				length: 16,
				charset: 'alphanumeric',
			}),
		});
	},

	clearPlayers: () => {
		return Cache
			.keys(PlayerDB.getKeyPattern())
			.then((keys) => {
				return Promise.all(
					_.map(keys, (key) => {
						return Cache.del(key);
					})
				);
			});
	},

};

module.exports = PlayerHelper;
