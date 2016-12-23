'use strict';

const GamesDB = require('src/data/game.data.js');

const GamesService = {
	createGame: () => {
		return GamesDB.create();
	},
};

module.exports = GamesService;
