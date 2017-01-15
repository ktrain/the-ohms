'use strict';

const flux = require('pico-flux');

let State = {};


const Store = flux.createStore({

	PLAYER: (player) => {
		State.player = player;
	},

});

Store.getPlayer = () => State.player;

Store.getGames = () => State.games;

module.exports = Store;
