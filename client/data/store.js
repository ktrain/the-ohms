'use strict';

const flux = require('pico-flux');
const Storage = require('data/storage');

let State = {};


const Store = flux.createStore({

	PLAYER: (player) => {
		Storage.put('player', player);
		console.log('player', player);
	},

	GAME_STATE: (gameState) => {
		State.gameState = gameState;
	},

});

Store.getPlayer = () => {
	return Storage.get('player');
};
Store.getGames = () => State.games;
Store.getGameState = () => State.gameState;

module.exports = Store;
