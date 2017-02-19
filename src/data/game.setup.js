'use strict';

const _ = require('lodash');
const config = require('nconf');

const SetupData = config.get('gameSetup');


const GameSetup = {

	getMinNumPlayers: () => _.min(_.keys(SetupData));
	getMaxNumPlayers: () => _.max(_.keys(SetupData));

	getGameSetupByNumPlayers: (numPlayers) => {
		const setup = _.clone(SetupData[numPlayers]);
		_.each(setup.rounds, (round) => {
			round = _.assign(round, {
				leaderIndex: null,
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
