'use strict';

const randomstring = require('randomstring');

const PlayerService = require('src/services/player.service.js');

const PlayerHelper = {
	createPlayer: () => {
		return PlayerService.createPlayer({
			name: randomstring.generate({
				length: 16,
				charset: 'alphanumeric',
			}),
		});
	},
};

module.exports = PlayerHelper;
