'use strict';

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

const GameService = require('src/services/game.service.js');
const EventEmitter = require('src/util/eventEmitter.js');

describe('Server events', () => {

	describe('Game events', () => {

		it('Game save', (done) => {
			const listener = (gameData) => {
				should.exist(gameData);
				gameData.should.have.property('id').that.is.a('string');
				EventEmitter.removeListener('game|save', listener);
				done();
			};
			EventEmitter.on('game|save', listener);
			GameService.createGame();
		});

	});
});
