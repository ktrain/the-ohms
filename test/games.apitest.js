'use strict';

// always require the init file
const testing = require('./test.init.js');
const request = require('supertest-as-promised');

const app = require('src/app');


describe('/games', () => {

	const basePath = '/v1/games';

	describe('POST', () => {

		it('creates a game', () => {
			return request(app)
				.post(basePath)
				.expect(200)
				.then((res) => {
					res.body.should.have.property('game').that.is.an('object');
					res.body.game.should.have.property('id').that.is.a('string');
					res.body.game.should.have.property('name').that.is.a('string');
				});
		});

	});

});
