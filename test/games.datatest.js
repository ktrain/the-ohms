'use strict';

// always require the init file
const testing = require('./test.init.js');
const should = testing.should;

const randomstring = require('randomstring');

const GameDB = require('src/data/game.data.js');
const GameService = require('src/services/game.service.js');

describe('GameDB', () => {

	it('generates ID on build', () => {
		return GameDB.build()
			.then((gameData) => {
				should.exist(gameData);
				gameData.should.have.property('id').that.is.a('string');
			});
	});

});
