'use strict';

const PlayerDB = require('src/data/player.data.js');

const PlayerService = {

	createPlayer: (data) => {
		return PlayerDB.create(data);
	},

	getPlayer: (playerId) => {
		return PlayerDB.get(playerId);
	},

	markPlayerInGame: (player, gameId) => {
		return PlayerDB.markPlayerInGame(player, gameId);
	},

	markPlayerNoGame: (player) => {
		return PlayerDB.markPlayerNoGame(player);
	},

};

module.exports = PlayerService;
