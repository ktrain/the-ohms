'use strict';

const GamesService = require('src/services/games.service.js');

const router = require('express').Router();

router.post('/', (req, res, next) => {
	GamesService.createGame(req.body)
		.then((game) => {
			res.status(200).send({
				game: game,
			});
		});
});

router.get('/', (req, res, next) => {
	GamesService.getAllGames()
		.then((games) => {
			res.status(200).send({
				list: games,
				count: games.length,
			});
		});
});

module.exports = router;
