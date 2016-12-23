'use strict';

const router = require('express').Router();

router.use('/players', require('./routers/players.router.js'));
router.use('/games',   require('./routers/games.router.js'));

module.exports = router;
