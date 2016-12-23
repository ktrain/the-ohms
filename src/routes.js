'use strict';

const router = require('express').Router();

const gamesRouter = require('./routers/games.router.js');

router.use('/games', gamesRouter);

module.exports = router;
