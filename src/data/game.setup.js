'use strict';

const GameSetup = {
	getMaxNumPlayers: () => { return 10; },
	getGameSetupByNumPlayers: (numPlayers) => {
		return {
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
		}[numPlayers];
	},
};

module.exports = GameSetup;
