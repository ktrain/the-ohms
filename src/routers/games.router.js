'use strict';

const GameService = require('src/services/game.service.js');

const router = require('express').Router();

router.post('/', (req, res, next) => {
	GameService.createGame(req.body)
		.then((game) => {
			res.status(200).send({
				game: game,
			});
		});
});

router.get('/', (req, res, next) => {
	GameService.getAllGames()
		.then((games) => {
			res.status(200).send({
				list: games,
				count: games.length,
			});
		});
});

module.exports = router;
