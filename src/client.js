'use strict';

const express = require('express');
const render = require('vitreum/steps/render');

const logger = require('src/util/logger.js')('clientRouter');
const templateFn = require('../client/template.js');

const router = express.Router();

router.use(express.static('build'));

router.get('/', (req, res) => {
	render('main', templateFn, {
		url: req.url,
	})
		.then((page) => {
			return res.status(200).send(page);
		})
		.catch(logger.error);
});

module.exports = router;
