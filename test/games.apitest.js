'use strict';

const _ = require('lodash');
const request = require('supertest-as-promised');

// always require the init file
const testing = require('./test.init.js');

const GameHelper = require('./helpers/game.helper.js');
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

	describe('GET', () => {

		before('Clear games', () => {
			return GameHelper.clearGames();
		});

		context('When there are no games', () => {

			it('shows no games', () => {
				return request(app)
					.get(basePath)
					.expect(200)
					.then((res) => {
						res.body.should.have.property('count').that.equals(0);
						res.body.should.have.property('list').that.is.an('array').with.length(0);
					});
			});

		});

		context('When there is one game', () => {

			before('Create one game', () => {
				return GameHelper.createGame();
			});

			it('shows one game', () => {
				return request(app)
					.get(basePath)
					.expect(200)
					.then((res) => {
						res.body.should.have.property('count').that.equals(1);
						res.body.should.have.property('list').that.is.an('array').with.length(res.body.count)
						res.body.list[0].should.be.an('object').with.property('id').that.is.a('string');
					});
			});

		});

		context('When there are multiple games', () => {

			before('Create a bunch-a games', () => {
				return Promise.all(_.times(10, () => { return GameHelper.createGame(); }));
			});

			it('shows multiple games', () => {
				return request(app)
					.get(basePath)
					.expect(200)
					.then((res) => {
						res.body.should.have.property('count').that.equals(11);
						res.body.should.have.property('list').that.is.an('array').with.length(res.body.count);
						_.each(res.body.list, (game) => {
							game.should.be.an('object').with.property('id').that.is.a('string');
						});
					});
			});

		});

	});

});
