'use strict';

const _ = require('lodash');
const request = require('supertest');

// always require the init file
const testing = require('./test.init.js');

const GameHelper = require('./helpers/game.helper.js');
const app = require('src/app');


describe('/games', () => {

	const basePath = '/v1/games';

	describe('/', () => {

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

	describe('/:gameId', () => {

		describe('GET', () => {

			context('When the game does not exist,', () => {

				const path = `${basePath}/not-a-real-gameId`;

				it('should respond 404', () => {
					return request(app)
						.get(path)
						.expect(404)
						.then((res) => {
							res.body.should.have.property('message');
						});
				});

			});

			context('When the game does exist,', () => {

				let path;
				let game;

				before('Create game', () => {
					return GameHelper.createGame()
						.then((g) => {
							game = g;
						});
				});

				it('gets the game', () => {
					path = `${basePath}/${game.id}`;
					return request(app)
						.get(path)
						.expect(200)
						.then((res) => {
							res.body.should.have.property('game');
							res.body.game.should.have.property('id').that.equals(game.id);
						});
				});

			});

		});

	});

});
