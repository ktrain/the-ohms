'use strict';

const PlayersService = require('src/services/players.service.js');

const router = require('express').Router();

router.post('/', (req, res, next) => {
	PlayersService.createPlayer(req.body)
		.then((player) => {
			res.status(200).send({
				player: player,
			});
		});
});

module.exports = router;
