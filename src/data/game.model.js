'use strict';

const GameSetup = require('src/data/game.setup.js');
const GameDB = require('src/data/game.data.js');


const GameModel = {
	initialize: function(data) {
		const state = _.defaults(_.cloneDeep(data), {
			name: null,
			players: [],
			spyIds: [],
			numSpies: 0,
			state: 'waiting for players',
			rounds: [],
			currentRoundIndex: 0,
			numRejections: 0,
			numSuccesses: 0,
			numFails: 0,
		});

		return {

			getData: () => {
				return state;
			},

			save: () => {
				return GameDB.save(state);
			},

			addPlayer: (player) => {
				if (!state.state === 'waiting for players') {
					// game has started already
					return this;
				}

				if (state.players.length >= GameSetup.getMaxNumPlayers()) {
					// game is full
					return this;
				}

				const playerAlreadyInGame = !!_.find(state.players, { id: player.id });
				if (playerAlreadyInGame) {
					// player is already in this game
					return this;
				}

				state.players.push(player);
				return this;
			},

			start: () => {
				if (!state.state === 'waiting for players') {
					// game has started already
					return this;
				}

				state.state = 'selecting team';
				this.save();

				const setup = GameSetup.getGameSetupByNumPlayers(state.players.length);

				state.numSpies = setup.numSpies;
				state.rounds = setup.rounds;
				state.currentRoundIndex = 0;

				this.save();
				return this;
			},

		};
	},
};

module.exports = GameModel;
