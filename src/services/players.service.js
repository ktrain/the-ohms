'use strict';

const PlayersDB = require('src/data/player.data.js');

const PlayersService = {
	createPlayer: (data) => {
		return PlayersDB.create(data);
	},
	getPlayer: (playerId) => {
		return PlayersDB.get(playerId);
	},
};

module.exports = PlayersService;
