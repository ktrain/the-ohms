'use strict';

const flux = require('pico-flux');

const logger = require('data/logger');
const request = require('data/request');
const Storage = require('data/storage');

let State = {};


const Store = flux.createStore({

	PLAYER_CREATE: (name) => {
		State.player = {
			data: {},
			status: {
				busy: true,
				error: null,
			},
		};
		Store.emitChange();
		request
			.post('/v1/players')
			.send({
				name: name,
			})
			.then((res) => {
				if (!res.body.player) {
					State.player.status.error = new Error(`Unexpected response from server: ${res.status} ${res.body}`);
				} else {
					State.player.data = res.body.player;
					Storage.put('player', State.player.data);
				}
				Store.emitChange();
			})
			.catch((err) => {
				State.player.status.error = err;
				Store.emitChange();
			});

		return false;
	},

});

Store.init = () => {
	State = {
		player: {
			data: Storage.get('player'),
			status: {
				busy: false,
				error: null,
			},
		},
	};
	logger.debug('Store init state', State);
	Store.emitChange();
};

Store.getPlayer = () => {
	return State.player;
};

module.exports = Store;
