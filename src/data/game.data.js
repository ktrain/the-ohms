'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const generateName = require('adjective-adjective-animal');

const logger = require('src/util/logger.js')('game');
const EventEmitter = require('src/util/eventEmitter.js');
const Cache = require('src/util/cache.js');

const GameSetup = require('./game.setup.js');

const GameDB = {

	prepareKey: (id) => {
		return `game-${id}`;
	},

	getKeyPattern: () => {
		return 'game-*';
	},

	prepareNewData: () => {
		return generateName({
			adjectives: 1,
			format: 'lower',
		}).then((name) => {
			return {
				id: uuid.v4(),
				name: name,
				state: 'waiting for players',
				players: [],
			};
		});
	},

	create: () => {
		return GameDB.build()
			.then((game) => {
				return GameDB.save(game);
			});
	},

	build: () => {
		return GameDB.prepareNewData();
	},

	save: (game) => {
		if (!game.id) {
			return Promise.reject(new Error('Game to save has no ID.'));
		}
		const key = GameDB.prepareKey(game.id);
		return Cache.put(key, game)
			.then((game) => {
				EventEmitter.emit('game|save', game);
				return game;
			});
	},

	get: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.get(key);
	},

	getAll: () => {
		return Cache.keys(GameDB.getKeyPattern())
			.then((keys) => {
				logger.debug('keys', keys);
				return Cache.getAll(keys);
			});
	},

	destroy: (id) => {
		const key = GameDB.prepareKey(id);
		return Cache.getAndDel(key)
			.then((game) => {
				EventEmitter.emit('game|delete', game);
				return game;
			});
	},

	hasPlayerId: (game, playerId) => {
		return !!_.find(game.players, (player) => { return player.id === playerId; });
	},

	doUnderLock: (id, doTheWork) => {
		const key = GameDB.prepareKey(id);

		return Cache.acquireLock(key).then((lock) => {
			return GameDB.get(id)
				.then(doTheWork)
				.catch((err) => {
					lock.unlock();
					throw err;
				}).then((res) => {
					lock.unlock();
					return res;
				});
		});
	},

	addPlayer: (id, player) => {
		if (!_.isObject(player)) {
			throw new Error(`Player must be an object. Received ${JSON.stringify(player)}.`);
		}

		logger.debug('acquiring lock to add player to game');
		return GameDB.doUnderLock(id, (game) => {
			if (!game) {
				throw new Error('Game does not exist.');
			}

			if (game.state !== 'waiting for players') {
				throw new Error('Game has already started.');
			}

			if (game.players.length >= GameSetup.getMaxNumPlayers()) {
				throw new Error('Game is full.');
			}

			const playerAlreadyInGame = GameDB.hasPlayerId(game, player.id);
			if (playerAlreadyInGame) {
				throw new Error('Player is already in this game.');
			}

			game.players.push(player);
			logger.debug('PLAYER ADDED');

			return GameDB.save(game);
		});
	},

	removePlayer: (id, playerId) => {
		return GameDB.doUnderLock(id, (game) => {
			if (!game) {
				throw new Error('Game does not exist.');
			}

			game.players = _.filter(game.players, (player) => {
				return player.id !== playerId;
			});

			return GameDB.save(game);
		});
	},

	startGame: (id) => {
		logger.debug('STARTING GAME', id);

		return GameDB.doUnderLock(id, (game) => {
			if (!game) {
				throw new Error('Game does not exist.');
			}

			if (game.state !== 'waiting for players') {
				throw new Error('Game has already started.');
			}

			if (game.players.length < GameSetup.getMinNumPlayers()) {
				throw new Error(`Cannot start without at least ${GameSetup.getMinNumPlayers()} players`);
			}

			game.state = 'selecting team';

			const setup = GameSetup.getGameSetupByNumPlayers(game.players.length);
			game.numSpies = setup.numSpies;
			game.rounds = setup.rounds;
			game.currentRoundIndex = 0;

			return GameDB.save(game);
		});
	},

};

module.exports = GameDB;
