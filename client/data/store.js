'use strict';

const flux = require('pico-flux');
const _ = require('lodash');
const Storage = require('data/storage');

const State = {};


const Store = flux.createStore({

	PAGE_STATE: (pageState) => {
		if (pageState === State.pageState) {
			return false;
		}
		State.pageState = pageState;
	},

	PLAYER: (player) => {
		if (player.id === _.get(State, 'player.id')) {
			return false;
		}
		Storage.put('player', player);
	},

	PLAYER_DELETE: () => {
		Storage.del('player');
	},

	GAMES: (games) => {
		State.games = games;
	},

	GAME_LEAVE: () => {
		delete State.gameState;
	},

	GAME_STATE: (gameState) => {
		State.gameState = gameState;
	},

});

Store.getPageState = () => State.pageState;
Store.getPlayer = () => {
	return Storage.get('player');
};
Store.getGames = () => State.games;
Store.getGameState = () => State.gameState;

module.exports = Store;
