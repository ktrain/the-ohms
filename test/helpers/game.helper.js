'use strict';

const GamesService = require('src/services/games.service.js');

const GameHelper = {

	createGame: () => {
		return GamesService.createGame();
	},

};

module.exports = GameHelper;
