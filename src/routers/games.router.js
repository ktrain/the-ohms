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
		})
		.catch(next);
});

router.get('/:gameId', (req, res, next) => {
	GameService.getGame(req.params.gameId)
		.then((game) => {
			if (!game) {
				return res.status(404).send({
					message: 'No game found with that ID',
					gameId: req.params.gameId,
				});
			}
			res.status(200).send(game);
		})
		.catch(next);
});

module.exports = router;
