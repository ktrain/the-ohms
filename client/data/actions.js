'use strict';

const dispatch = require('pico-flux').dispatch;
const request = require('./request.js');
const storage = require('./storage.js');

const Actions = {

	loadPlayerFromStorage: () => {
		const player = storage.get('player');
		if (player) {
			dispatch('PLAYER', player);
		}
	},

	// http actions

	createPlayer: (name) => {
		return request
			.post('/v1/players')
			.send({ name: name })
			.then((res) => {
				dispatch('PLAYER', res.body.player);
			})
			.catch((err) => {
				console.error(err);
				throw new Error('Failed to create player.');
			});
	},

	getGames: () => {
		return request
			.get('/v1/games')
			.then((res) => {
				dispatch('GAMES', res.body.list)
			})
			.catch((err) => {
				console.error(err);
				throw new Error('Could not fetch list of games.');
			});
	},


	// socket actions
	connectAndCreateGame: () => {
		dispatch('SOCKET_CONNECT_AND_CREATE_GAME');
	},

	connectAndJoinGame: (gameId) => {
		dispatch('SOCKET_CONNECT_AND_JOIN_GAME', gameId);
	},

	leaveGame: () => {
		dispatch('SOCKET_GAME_LEAVE');
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
