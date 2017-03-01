'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('logic');

const GameSetup = require('src/data/game.setup.js');


const LogicService = {

	getPlayerIndex: (game, playerId) => {
		return _.findIndex(game.players, (player) => { return playerId === player.id; });
	},

	gameHasPlayerId: (game, playerId) => {
		return (LogicService.getPlayerIndex(game, playerId) >= 0);
	},

	gameTeamHasPlayerId: (game, playerId) => {
		return _.includes(game.rounds[game.roundIndex].team, playerId);
	},

	getNextLeaderIndex: (game) => {
		return (game.rounds[game.roundIndex].leaderIndex + 1) % game.players.length;
	},


	/**
	 * the following functions all take a game state and return a modified game state
	 */

	startGame: (g) => {
		const game = _.cloneDeep(g);

		game.state = 'selecting team';

		const setup = GameSetup.getDataByNumPlayers(game.players.length);
		game.spyIndices = _.sampleSize(_.range(0, game.players.length), setup.numSpies);
		game.spyIndices.sort();
		game.rounds = setup.rounds;
		game.roundIndex = 0;
		game.rounds[game.roundIndex].leaderIndex = _.random(0, game.players.length-1);

		return game;
	},

	selectTeam: (g, team) => {
		const game = _.cloneDeep(g);

		game.state = 'voting on team';
		game.rounds[game.roundIndex].team = _.cloneDeep(team);

		return game;
	},

	submitTeamVote: (g, playerId, vote) => {
		let game = _.cloneDeep(g);

		game.rounds[game.roundIndex].votes[playerId] = vote;

		game = LogicService.tallyTeamVotes(game);

		return game;
	},

	tallyTeamVotes: (g) => {
		const game = _.cloneDeep(g);

		const currentRound = game.rounds[game.roundIndex];
		const voteValues = _.values(currentRound.votes);

		if (voteValues.length < game.players.length) {
			// voting is incomplete
			return game;
		}

		// group votes by value
		const votes = _.groupBy(voteValues);
		logger.debug('voting complete', votes);

		if (!votes[false] || (!!votes[true] && votes[true].length > votes[false].length)) {
			// team approved
			game.state = 'executing mission';
		} else {
			// team rejected
			// reset the round and increment the number of rejections
			currentRound.numRejections++;
			if (currentRound.numRejections >= 5) {
				game.state = 'spies win';
			} else {
				currentRound.votes = {};
				currentRound.leaderIndex = LogicService.getNextLeaderIndex(game);
				game.state = 'selecting team';
			}
		}

		return game;
	},

	submitMissionAction: (g, playerId, action) => {
		let game = _.cloneDeep(g);

		game.rounds[game.roundIndex].mission[playerId] = action;
		game = LogicService.tallyMissionActions(game);

		return game;
	},

	tallyMissionActions: (g) => {
		let game = _.cloneDeep(g);

		const currentRound = game.rounds[game.roundIndex];
		const missionValues = _.values(currentRound.mission);

		if (missionValues.length < currentRound.team.length) {
			// mission is incomplete
			return game;
		}

		// group mission actions by value
		const mission = _.groupBy(missionValues);
		logger.debug('mission complete', mission);

		if (!mission[false] || mission[false].length < currentRound.numFailsRequired) {
			game.numSuccesses++;
		} else {
			game.numFails++;
		}

		game = LogicService.tallyRoundResults(game);

		// check whether the game is over
		if (game.state === 'executing mission') {
			// prepare for the next round
			game.state = 'selecting team';
			const newLeaderIndex = LogicService.getNextLeaderIndex(game);
			game.roundIndex++;
			game.rounds[game.roundIndex].leaderIndex = newLeaderIndex;
		}

		return game;
	},

	tallyRoundResults: (g) => {
		const game = _.cloneDeep(g);

		if (game.numSuccesses >= 3) {
			// ohms win
			game.state = 'ohms win';
		} else if (game.numFails >= 3) {
			// spies win
			game.state = 'spies win';
		}
		
		return game;
	},  

};

module.exports = LogicService;
