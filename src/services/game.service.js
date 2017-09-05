'use strict';

const _ = require('lodash');
const logger = require('src/util/logger.js')('gameService');

const EventEmitter = require('src/util/eventEmitter.js');
const GameSetup = require('src/data/game.setup.js');
const GameDB = require('src/data/game.data.js');
const PlayerService = require('src/services/player.service.js');
const LogicService = require('src/services/logic.service.js');

const GameService = {

	createGame: () => {
		return GameDB.create();
	},

	getGame: (gameId) => {
		return GameDB.get(gameId);
	},

	getAllGames: () => {
		return GameDB.getAll();
	},

	deleteGame: (gameId) => {
		return GameDB.destroy(gameId);
	},

	addPlayerToGame: (gameId, playerId) => {
		return PlayerService.getPlayer(playerId).then((player) => {
			if (!player) {
				throw new Error(`Player ${playerId} does not exist`);
			}
			if (player.gameId && player.gameId !== gameId) {
				throw new Error(`Player is already in another game ${player.gameId}`);
			}

			return GameDB.doUnderLock(gameId, (game) => {
				const playerIndex = LogicService.getPlayerIndex(game, playerId);
				if (playerIndex >= 0) {
					// player is already in this game
					return GameDB.save(game);
				}

				if (game.state !== 'waiting for players') {
					throw new Error(`Game ${gameId} has already started`);
				}

				if (game.players.length >= GameSetup.getMaxNumPlayers()) {
					throw new Error(`Game ${gameId} is full`);
				}

				game.players.push(player);
				logger.debug('PLAYER ADDED');

				return GameDB.save(game);
			})
				.then((game) => {
					EventEmitter.emit('game|playerJoin', game, playerId);
					return game;
				});
		});
	},

	removePlayerFromGame: (gameId, playerId) => {
		logger.debug(`Removing player ${playerId} from game ${gameId}`);
		return GameDB.doUnderLock(gameId, (game) => {
			game.players = _.filter(game.players, (player) => {
				return player.id !== playerId;
			});

			if (game.players.length === 0) {
				logger.debug('game is empty; destroying', gameId);
				return GameDB.destroy(gameId);
			}

			return GameDB.save(game);
		})
			.then((game) => {
				EventEmitter.emit('game|playerLeave', game, playerId);
				return game;
			});
	},

	getGameSetupData: () => {
		return GameSetup.getData();
	},

};

module.exports = GameService;
