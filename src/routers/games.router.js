'use strict';

const GamesService = require('src/services/games.service.js');

const router = require('express').Router();

router.post('/', (req, res, next) => {
	GamesService.createGame(req.body)
		.then((game) => {
			res.status(200).send({
				game: game.getData(),
			});
		});
});

module.exports = router;
