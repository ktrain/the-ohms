'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const generateName = require('adjective-adjective-animal');
const config = require('nconf');

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
				const expiry = config.get('data:game:expirySeconds');
				logger.trace('expiring game after', expiry);
				return Cache.expire(key, expiry)
					.then(() => {
						return game;
					});
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

	getPlayerIndex: (game, playerId) => {
		return _.findIndex(game.players, (player) => { return player.id === playerId; });
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

	addPlayer: (id, playerData) => {
		if (!_.isObject(playerData)) {
			throw new Error(`Player must be an object. Received ${JSON.stringify(playerData)}.`);
		}

		const player = _.pick(playerData, ['id', 'name']);

		return GameDB.doUnderLock(id, (game) => {
			if (!game) {
				throw new Error('Game does not exist.');
			}

			const playerIndex = GameDB.getPlayerIndex(game, player.id);
			if (playerIndex >= 0) {
				// player is already in this game
				return GameDB.save(game);
			}

			if (game.state !== 'waiting for players') {
				throw new Error('Game has already started.');
			}

			if (game.players.length >= GameSetup.getMaxNumPlayers()) {
				throw new Error('Game is full.');
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

			if (game.state !== 'waiting for players') {
				throw new Error('Players cannot be removed once a game has started.');
			}

			game.players = _.filter(game.players, (player) => {
				return player.id !== playerId;
			});

			if (game.players.length === 0) {
				logger.debug('game is empty; destroying', id);
				return GameDB.destroy(id);
			}

			return GameDB.save(game);
		});
	},

	startGame: (id) => {
		logger.info('STARTING GAME', id);

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
			game.spyIndices = _.sampleSize(_.range(0, game.players.length), setup.numSpies);
			game.spyIndices.sort();
			game.rounds = setup.rounds;
			game.currentRoundIndex = 0;
			game.currentRound = {
				leaderIndex: _.random(0, game.players.length-1),
				team: [],
				votes: {},
				mission: {},
			};

			return GameDB.save(game);
		});
	},

};

module.exports = GameDB;
