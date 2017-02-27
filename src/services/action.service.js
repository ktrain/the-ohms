'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('actions');

const GameDB = require('src/data/game.data.js');
const GameSetup = require('src/data/game.setup.js');
const GameService = require('src/services/game.service.js');
const LogicService = require('src/services/logic.service.js');

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

			const newGameState = LogicService.startGame(game);

			return GameDB.save(newGameState);
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
				const playerIndex = LogicService.getPlayerIndex(game, playerId);
				if (playerIndex < 0) {
					throw new Error(`Invalid team: player ${playerId} is not in the game`);
				}
			});

			const newGameState = LogicService.selectTeam(game, team);

			return GameDB.save(newGameState);
		});
	},

	submitTeamVote: (gameId, playerId, vote) => {
		return GameDB.doUnderLock(gameId, (game) => {
			if (!LogicService.gameHasPlayerId(game, playerId)) {
				throw new Error(`Player ${playerId} is not in game {gameId}`);
			}

			if (game.state !== 'voting on team') {
				throw new Error('A team can only be approved when the game is in `voting on team` state');
			}

			const newGameState = LogicService.submitTeamVote(game, playerId, vote);

			return GameDB.save(newGameState);
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
			if (!LogicService.gameTeamHasPlayerId(game, playerId)) {
				throw new Error('Only players on the mission team can submit a mission action');
			}

			if (game.state !== 'executing mission') {
				throw new Error('A mission action can only be submitted when the game is in `executing mission` state');
			}

			const newGameState = LogicService.submitMissionAction(game, playerId, action);

			return GameDB.save(newGameState);
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
