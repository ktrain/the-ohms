'use strict';

const _ = require('lodash');


const ActionHelper = {

	getRandomTeam: (game, teamSize = game.rounds[game.roundIndex].teamSize) => {
		return _.map(_.sampleSize(game.players, teamSize), 'id');
	},

	getRandomBoolean: () => {
		return _.sample([true, false]);
	},

};

module.exports = ActionHelper;
