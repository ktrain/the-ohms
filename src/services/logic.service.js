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
		return !!_.find(game.rounds[game.roundIndex].team, playerId);
	},


	/**
	 * the following functions all take a game state and return a modified game state
	 */

	startGame: (g) => {
		const game = _.cloneDeep(g);

		game.state = 'selecting team';

		const setup = GameSetup.getGameSetupByNumPlayers(game.players.length);
		game.spyIndices = _.sampleSize(_.range(0, game.players.length), setup.numSpies);
		game.spyIndices.sort();
		game.rounds = setup.rounds;
		game.roundIndex = 0;
		game.rounds[game.roundIndex].leaderIndex = _.random(0, game.players.length-1);

		return game;
	},

	selectTeam: (g, team) => {
		const game = _.clone(g);

		game.state = 'voting on team';
		game.rounds[game.roundIndex].team = _.clone(team);

		return game;
	},

	submitTeamVote: (g, playerId, vote) => {
		let game = _.cloneDeep(g);

		game.rounds[game.roundIndex].votes[playerId] = !!vote;

		game = LogicService.tallyTeamVotes(game);

		return game;
	},

	tallyTeamVotes: (g) => {
		const game = g.cloneDeep();

		const currentRound = game.rounds[game.roundIndex];
		const voteValues = _.values(currentRound.votes);

		if (voteValues.length < game.players.length) {
			// voting is incomplete
			return game;
		}

		// group votes by value
		const votes = _.groupBy(voteValues);
		logger.debug('voting complete', votes);

		if (votes[true].length > votes[false].length) {
			// team approved
			game.state = 'executing mission';
		} else {
			// team rejected
			// reset the round and increment the number of rejections
			currentRound.numRejections++;
			if (currentRound.numRejections >= 5) {
				game.state = 'spies win';
			} else {
				currentRound.leaderIndex = (currentRound.leaderIndex + 1) % game.players.length;
				game.state = 'selecting team';
			}
		}

		return game;
	},

	submitMissionAction: (g, playerId, action) => {
		let game = _.cloneDeep(g);

		game.rounds[game.roundIndex].mission[playerId] = !!action;
		game = LogicService.tallyMissionActions(game);

		return game;
	},

	tallyMissionActions: (g) => {
		let game = g.cloneDeep();

		const currentRound = game.rounds[game.roundIndex];
		const missionValues = _.values(currentRound.mission);

		if (missionValues.length < currentRound.team.length) {
			// mission is incomplete
			return game;
		}

		// group mission actions by value
		const mission = _.groupBy(missionValues);
		logger.debug('mission complete', mission);

		if (mission[false].length < currentRound.numFailsRequired) {
			game.numSuccesses++;
		} else {
			game.numFails++;
		}

		game = LogicService.tallyRoundResults(game);

		// check whether the game is over
		if (game.state === 'executing mission') {
			game.state = 'selecting team';
			game.roundIndex++;
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
