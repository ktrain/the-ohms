'use strict';

const dispatch = require('pico-flux').dispatch;

const Actions = {

	createPlayer: (name) => {
		dispatch('PLAYER_CREATE', name);
	},

};

module.exports = Actions;
