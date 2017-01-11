'use strict';

// always require the init file
const testing = require('./test.init.js');
const request = require('supertest');
const randomstring = require('randomstring');

const app = require('src/app');


describe('/players', () => {

	const basePath = '/v1/players';

	describe('POST', () => {

		it('creates a player', () => {
			return request(app)
				.post(basePath)
				.send({
					name: randomstring.generate({ length: 16, charset: 'alphanumeric' }),
				})
				.expect(200)
				.then((res) => {
					res.body.should.have.property('player').that.is.an('object');
					res.body.player.should.have.property('id').that.is.a('string');
					res.body.player.should.have.property('name').that.is.a('string');
				});
		});

	});

});
