'use strict';

const _ = require('lodash');
const config = require('nconf');

const SetupData = config.get('gameSetup');

// parse the number keys (they have to be strings in JSON)
const numberizedKeys = _.map(_.keys(SetupData), (key) => parseInt(key));
const minNumPlayers = _.min(numberizedKeys);
const maxNumPlayers = _.max(numberizedKeys);


const GameSetup = {

	getMinNumPlayers: () => minNumPlayers,
	getMaxNumPlayers: () => maxNumPlayers,

	getGameSetupByNumPlayers: (numPlayers) => {
		const setup = _.cloneDeep(SetupData[numPlayers]);
		setup.rounds = _.map(setup.rounds, (round) => {
			return _.assign(round, {
				team: [],
				votes: {},
				mission: {},
				numRejections: 0,
			});
		});
		return setup;
	},

};

module.exports = GameSetup;
