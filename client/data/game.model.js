'use strict';

const _ = require('lodash');


const GameModel = function(gameState, playerId) {
	const game = _.assign(gameState, {

		playerId: playerId,

		getCurrentRound: () => {
			if (!_.isNumber(game.roundIndex) || !game.rounds) {
				return null;
			}
			return game.rounds[game.roundIndex];
		},

		getLeader: () => {
			if (game.state === 'waiting for players') {
				return game.players[0];
			}
			const leaderIndex = game.getCurrentRound().leaderIndex;
			return game.players[leaderIndex];
		},

		amLeader: () => {
			return playerId === game.getLeader().id;
		},

		amOnTeam: () => {
			console.log(game.getCurrentRound().team, playerId);
			return _.includes(game.getCurrentRound().team, playerId);
		},

		getPlayer: (playerId) => {
			return _.find(game.players, (player) => {
				return playerId === player.id;
			});
		},

		getVote: () => {
			const path = `votes['${playerId}']`;
			return _.get(game.getCurrentRound(), path, null);
		},

		getAction: () => {
			const path = `mission['${playerId}']`;
			return _.get(game.getCurrentRound(), path, null);
		},

		getData: () => {
			return gameState;
		},

	});

	return game;
};

module.exports = GameModel;
