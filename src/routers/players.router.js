'use strict';

const PlayerService = require('src/services/player.service.js');

const router = require('express').Router();

router.post('/', (req, res, next) => {
	PlayerService.createPlayer(req.body)
		.then((player) => {
			res.status(200).send(player);
		})
		.catch(next);
});

router.get('/:playerId', (req, res, next) => {
	PlayerService.getPlayer(req.params.playerId)
		.then((player) => {
			if (!player) {
				return res.status(404).send({
					message: 'No player found with that ID.',
					playerId: req.params.playerId,
				});
			}
			res.status(200).send(player);
		})
		.catch(next);
});

module.exports = router;
