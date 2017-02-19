'use strict';

const _ = require('lodash');


const SetupData = {
	2: {
		numSpies: 1,
		rounds: [
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
		],
	},
	3: {
		numSpies: 2,
		rounds: [
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
			{
				teamSize: 2,
				numFailsRequired: 2,
			},
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
			{
				teamSize: 2,
				numFailsRequired: 2,
			},
			{
				teamSize: 1,
				numFailsRequired: 1,
			},
		],
	},
	5: {
		numSpies: 2,
		rounds: [
			{
				teamSize: 2,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 2,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
		],
	},
	6: {
		numSpies: 2,
		rounds: [
			{
				teamSize: 2,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
		],
	},
	7: {
		numSpies: 3,
		rounds: [
			{
				teamSize: 2,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 2,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
		],
	},
	8: {
		numSpies: 3,
		rounds: [
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 5,
				numFailsRequired: 2,
			},
			{
				teamSize: 5,
				numFailsRequired: 1,
			},
		],
	},
	9: {
		numSpies: 3,
		rounds: [
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 5,
				numFailsRequired: 2,
			},
			{
				teamSize: 5,
				numFailsRequired: 1,
			},
		],
	},
	10: {
		numSpies: 4,
		rounds: [
			{
				teamSize: 3,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 4,
				numFailsRequired: 1,
			},
			{
				teamSize: 5,
				numFailsRequired: 2,
			},
			{
				teamSize: 5,
				numFailsRequired: 1,
			},
		],
	},
};


const GameSetup = {
	getMinNumPlayers: () => { return 2; },
	getMaxNumPlayers: () => { return 10; },
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
