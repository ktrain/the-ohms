'use strict';

const _ = require('lodash');

const EventEmitter = require('src/util/eventEmitter.js');
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

		const self = {

			getData: () => {
				return state;
			},

			save: () => {
				EventEmitter.emit('game|save', state);
				return GameDB.save(state)
					.then(() => {
						return self;
					});
			},

			delete: () => {
				EventEmitter.emit('game|delete', state);
				return GameDB.destroy(state.id);
			},

			addPlayer: (player) => {
				if (!state.state === 'waiting for players') {
					// game has started already
					return self;
				}

				if (state.players.length >= GameSetup.getMaxNumPlayers()) {
					// game is full
					return self;
				}

				const playerAlreadyInGame = !!_.find(state.players, { id: player.id });
				if (playerAlreadyInGame) {
					// player is already in this game
					return self;
				}

				state.players.push(player);

				self.save();
				return self;
			},

			start: () => {
				if (!state.state === 'waiting for players') {
					// game has started already
					return self;
				}

				state.state = 'selecting team';

				const setup = GameSetup.getGameSetupByNumPlayers(state.players.length);
				state.numSpies = setup.numSpies;
				state.rounds = setup.rounds;
				state.currentRoundIndex = 0;

				self.save();
				return self;
			},

		};

		return self;
	},
};

module.exports = GameModel;
