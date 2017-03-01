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

	getData: () => {
		return _.cloneDeep(SetupData);
	},

	getDataByNumPlayers: (numPlayers) => {
		const data = GameSetup.getData()[numPlayers];
		data.rounds = _.map(data.rounds, (round) => {
			return _.assign(round, {
				team: [],
				votes: {},
				mission: {},
				numRejections: 0,
			});
		});
		return data;
	},

};

module.exports = GameSetup;
