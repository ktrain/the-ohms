'use strict';

const randomstring = require('randomstring');

const PlayersService = require('src/services/players.service.js');

const PlayerHelper = {
	createPlayer: () => {
		return PlayersService.createPlayer({
			name: randomstring.generate({
				length: 16,
				charset: 'alphanumeric',
			}),
		});
	},
};

module.exports = PlayerHelper;
