'use strict';

// always require the init file
const testing = require('../test.init.js');
const should = testing.should;

const randomstring = require('randomstring');

const PlayerDB = require('src/data/player.data.js');

const generatePlayerName = () => {
	const number = randomstring.generate({ length: 16, charset: 'alphanumeric' });
	return `Player ${number}`;
};

describe('PlayerDB', () => {

	it('generates ID on save', () => {
		return PlayerDB.create({
			name: generatePlayerName(),
		}).then((player) => {
			should.exist(player);
			player.should.have.property('id').that.is.a('string');
		});
	});

});
