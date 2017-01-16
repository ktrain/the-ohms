'use strict';

const GameService = require('src/services/game.service.js');

const router = require('express').Router();

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
