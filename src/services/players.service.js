'use strict';

const PlayersDB = require('src/data/player.data.js');

const PlayersService = {
	createPlayer: (data) => {
		return PlayersDB.create(data);
	},
};

module.exports = PlayersService;
