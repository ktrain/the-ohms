'use strict';

const flux = require('pico-flux');

let State = {};


const Store = flux.createStore({

	PLAYER: (player) => {
		State.player = player;
	},

	GAME_STATE: (gameState) => {
		State.gameState = gameState;
	},

});

Store.getPlayer    = () => State.player;
Store.getGames     = () => State.games;
Store.getGameState = () => State.gameState;

module.exports = Store;
