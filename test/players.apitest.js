'use strict';

// always require the init file
const testing = require('./test.init.js');
const request = require('supertest');
const randomstring = require('randomstring');

const PlayerHelper = require('./helpers/player.helper.js');
const app = require('src/app');


describe('/players', () => {

	const basePath = '/v1/players';

	describe('/', () => {

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

	describe('/:playerId', () => {

		describe('GET', () => {

			context('If the player does not exist,', () => {

				const path = `${basePath}/not-a-real-playerId`;

				it('responds 404', () => {
					return request(app)
						.get(path)
						.expect(404)
						.then((res) => {
							res.body.should.have.property('message');
						});
				});

			});

			context('If the player does exist,', () => {

				let path;
				let player;

				before('Create player', () => {
					return PlayerHelper.createPlayer()
						.then((p) => {
							player = p;
						});
				});

				it('gets the player', () => {
					path = `${basePath}/${player.id}`;
					return request(app)
						.get(path)
						.expect(200)
						.then((res) => {
							res.body.should.have.property('player');
							res.body.player.should.have.property('id').that.equals(player.id);
							res.body.player.should.have.property('name').that.equals(player.name);
						});
				});

			});

		});

	});

});
