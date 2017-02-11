'use strict';

const flux = require('pico-flux');
const _ = require('lodash');
const Storage = require('data/storage');

const State = {};


const Store = flux.createStore({

	PAGE_STATE: (pageState) => {
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

	GAME_STATE: (gameState) => {
		State.gameState = gameState;
	},

	SOCKET: (socket) => {
		State.socket = socket;
		State.socket.on('event', (event) => {
			console.log('received client update');
			console.log(event);
			State.gameState = event.payload;
			Store.emitChange();
		});
	},

});

Store.getPageState = () => State.pageState;
Store.getPlayer = () => {
	return Storage.get('player');
};
Store.getGames = () => State.games;
Store.getGameState = () => State.gameState;

module.exports = Store;
