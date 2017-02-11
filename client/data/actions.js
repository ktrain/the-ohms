'use strict';

const _ = require('lodash');
const dispatch = require('pico-flux').dispatch;
const socketClient = require('socket.io-client');
const request = require('data/request');

const Store = require('data/store');


const Actions = {

	setPageState: (pageState) => {
		dispatch('PAGE_STATE', pageState);
	},

	// http actions

	createPlayer: (name) => {
		let formattedName = _.capitalize(name);
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
		const client = socketClient('/', { query: `playerId=${player.id}` });
		dispatch('SOCKET', client);
	},

	connectAndJoinGame: (gameId) => {
		const player = Store.getPlayer();
		if (!player) {
			throw new Error('No player; cannot create a game');
		}
		const client = socketClient('/', { query: `playerId=${player.id}&gameId=${gameId}` });
		dispatch('SOCKET', client);
	},

	leaveGame: () => {
		dispatch('SOCKET_DISCONNECT');
	},

	startGame: () => {
		dispatch('SOCKET_GAME_START');
	},

	selectTeam: (team) => {
		dispatch('SOCKET_TEAM_SELECT', team);
	},

	approveTeam: () => {
		dispatch('SOCKET_TEAM_APPROVE');
	},

	rejectTeam: () => {
		dispatch('SOCKET_TEAM_REJECT');
	},

	succeedMission: () => {
		dispatch('SOCKET_MISSION_SUCCEED');
	},

	failMission: () => {
		dispatch('SOCKET_MISSION_FAIL');
	},

};

module.exports = Actions;
