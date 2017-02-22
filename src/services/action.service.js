'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('actions');

const GameDB = require('src/data/game.data.js');
const GameSetup = require('src/data/game.setup.js');
const GameService = require('src/services/game.service.js');

const ActionService = {

	leaveGame: (gameId, playerId) => {
		logger.debug(`${playerId} leaving game ${gameId}`);
		return GameService.removePlayerFromGame(gameId, playerId);
	},

	kickPlayerFromGame: (gameId, kickerId, kickeeId) => {
		logger.debug(`Kicking player ${kickeeId} from game ${gameId}`);
		return GameService.getGame(gameId).then((game) => {
			if (game.players[0].id !== kickerId) {
				throw new Error('Players can only be kicked by the player who least recently joined the game');
			}
			return GameService.removePlayerFromGame(gameId, kickeeId);
		});
	},

	startGame: (gameId, playerId) => {
		logger.debug(`Starting game ${gameId}`);
		return GameDB.doUnderLock(gameId, (game) => {
			if (game.players[0].id !== playerId ) {
				throw new Error('Game can only be started by the player who least recently joined the game');
			}

			if (game.state !== 'waiting for players') {
				throw new Error(`Game ${gameId} has already started`);
			}

			if (game.players.length < GameSetup.getMinNumPlayers()) {
				throw new Error(`Cannot start game ${gameId} without at least ${GameSetup.getMinNumPlayers()} players`);
			}

			game.state = 'selecting team';

			const setup = GameSetup.getGameSetupByNumPlayers(game.players.length);
			game.spyIndices = _.sampleSize(_.range(0, game.players.length), setup.numSpies);
			game.spyIndices.sort();
			game.rounds = setup.rounds;
			game.roundIndex = 0;
			game.rounds[game.roundIndex].leaderIndex = _.random(0, game.players.length-1);

			return GameDB.save(game);
		});
	},

	selectTeam: (gameId, playerId, team) => {
		return GameDB.doUnderLock(gameId, (game) => {
			const currentRound = game.rounds[game.roundIndex];
			const leaderIndex = currentRound.leaderIndex;
			if (game.players[leaderIndex].id !== playerId) {
				throw new Error('Only the round leader can select a team');
			}

			if (game.state !== 'selecting team') {
				throw new Error('A team can only be selected when the game is in `selecting team` state');
			}

			const expectedTeamSize = currentRound.teamSize;
			if (team.length !== expectedTeamSize) {
				throw new Error(`Invalid team: must have ${expectedTeamSize} players this round`);
			}

			_.each(team, (playerId) => {
				const playerIndex = GameService.getPlayerIndex(game, playerId);
				if (playerIndex < 0) {
					throw new Error(`Invalid team: player ${playerId} is not in the game`);
				}
			});

			currentRound.team = team;
			game.state = 'voting on team';

			return GameDB.save(game);
		});
	},

	submitTeamVote: (gameId, playerId, vote) => {
		return GameDB.doUnderLock(gameId, (game) => {
			if (!GameService.gameHasPlayerId(game, playerId)) {
				throw new Error(`Player ${playerId} is not in game {gameId}`);
			}

			if (game.state !== 'voting on team') {
				throw new Error('A team can only be approved when the game is in `voting on team` state');
			}

			game.rounds[game.roundIndex].votes[playerId] = !!vote;
			GameService.tallyTeamVotes(game);

			return GameDB.save(game);
		});
	},

	submitTeamVoteApprove: (gameId, playerId) => {
		return ActionService.submitTeamVote(gameId, playerId, true);
	},

	submitTeamVoteReject: (gameId, playerId) => {
		return ActionService.submitTeamVote(gameId, playerId, false);
	},

	submitMissionAction: (gameId, playerId, action) => {
		return GameDB.doUnderLock(gameId, (game) => {
			if (!GameService.gameTeamHasPlayerId(game, playerId)) {
				throw new Error('Only players on the mission team can submit a mission action');
			}

			if (game.state !== 'executing mission') {
				throw new Error('A mission action can only be submitted when the game is in `executing mission` state');
			}

			game.rounds[game.roundIndex].mission[playerId] = !!action;
			GameService.tallyMissionActions(game);

			return GameDB.save(game);
		});
	},

	submitMissionSucceed: (gameId, playerId) => {
		return ActionService.submitMissionAction(true);
	},

	submitMissionFail: (gameId, playerId) => {
		return ActionService.submitMissionAction(false);
	},

};

module.exports = ActionService;
