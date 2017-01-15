'use strict';

const PlayerService = require('src/services/player.service.js');

const router = require('express').Router();

router.post('/', (req, res, next) => {
	PlayerService.createPlayer(req.body)
		.then((player) => {
			res.status(200).send({
				player: player,
			});
		});
});

module.exports = router;
