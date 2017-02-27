'use strict';

const _ = require('lodash');
const dispatch = require('pico-flux').dispatch;
const request = require('data/request');

const Messenger = require('data/messenger');
const Store = require('data/store');


const Actions = {

	setPageState: (pageState) => {
		dispatch('PAGE_STATE', pageState);
	},


	// http actions

	createPlayer: (name) => {
		let formattedName = _.capitalize(name).trim();
		const currentPlayer = Store.getPlayer();
		if (currentPlayer && currentPlayer.name === formattedName) {
			return Promise.resolve();
		}
		return request
			.post('/v1/players')
			.send({ name: formattedName })
			.then((res) => {
				dispatch('PLAYER', res.body);
			})
			.catch((err) => {
				console.error(err);
				throw new Error('Failed to activate agent.');
			});
	},

	getPlayer: (playerId) => {
		return request
			.get(`/v1/players/${playerId}`)
			.then((res) => {
				const player = res.body;
				dispatch('PLAYER', player);
				return player;
			});
	},

	clearPlayer: () => {
		dispatch('PLAYER_CLEAR');
	},

	getGames: () => {
		return request
			.get('/v1/games')
			.then((res) => {
				const games = res.body.list;
				dispatch('GAMES', games);
			})
			.catch((err) => {
				console.error(err);
				throw new Error('Could not fetch list of games.');
			});
	},


	// socket actions

	connectAndCreateGame: () => {
		const player = Store.getPlayer();
		if (!player) {
			throw new Error('No player; cannot create a game');
		}
		Actions.openGameConnection('/', { query: `playerId=${player.id}` });
	},

	connectAndJoinGame: (gameId) => {
		const player = Store.getPlayer();
		if (!player) {
			throw new Error('No player; cannot create a game');
		}
		Actions.openGameConnection('/', { query: `playerId=${player.id}&gameId=${gameId}` });
	},

	openGameConnection: (url, query) => {
		Messenger.connect(url, query,
			(event) => {
				console.log('clientUpdate', event);
				dispatch('GAME_STATE', event.payload);
			},
			(err) => {
				console.error('Messenger Error:', err);
			}
		);
	},

	leaveGame: () => {
		Messenger.send('leaveGame');
		dispatch('GAME_LEAVE');
	},

	kickPlayer: (playerId) => {
		Messenger.send('kickPlayer', { playerId });
	},

	startGame: () => {
		Messenger.send('startGame');
	},

	selectTeam: (team) => {
		Messenger.send('selectTeam', { team });
	},

	approveTeam: () => {
		Messenger.send('approveTeam');
	},

	rejectTeam: () => {
		Messenger.send('rejectTeam');
	},

	succeedMission: () => {
		Messenger.send('succeedMission');
	},

	failMission: () => {
		Messenger.send('failMission');
	},

};

module.exports = Actions;
