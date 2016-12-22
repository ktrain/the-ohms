'use strict';

// always require the init file
const testing = require('../test.init.js');
const should = testing.should;

const randomstring = require('randomstring');

const GameDB = require('src/data/game.data.js');

describe('GameDB', () => {

	it('generates ID on save', () => {
		return GameDB.create({
		}).then((game) => {
			should.exist(game);
			game.should.have.property('id').that.is.a('string');
		});
	});

});
