'use strict';

const PlayersService = require('src/services/players.service.js');

module.exports = {
	initialize: (data) => {
		const state = _.defaults(_.cloneDeep(data), {
			name: null,
			players: [],
			state: 'waiting for players',
			rounds: [],
			currentRound: {},
			numRejections: 0,
			numSuccesses: 0,
			numFails: 0,
		});

		return {
			addPlayer: (playerId) => {
				const player = _.find(state.players, { id: playerId });
				if (player) {
					return this;
				}
				state.players.push(playerId);
				return this;
			},
		};
	},
};
