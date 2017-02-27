'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('nconf');

const logger = require('src/util/logger.js')('routing');
const routes = require('./routes.js');
const clientRoutes = require('./client.js');

const app = express();

app.set('trust proxy');

if (config.get('redirectToSSL')) {
	app.use((req, res, next) => {
		logger.trace('redirecting to SSL');
		if (req.header('x-forwarded-proto') !== 'https') {
			return res.redirect(302, `https://${req.get('Host')}${req.url}`);
		}
		next();
	});
}

if (config.get('NODE_ENV') !== 'production') {
	app.use((req, res, next) => {
		let data = {};
		if (!_.isEmpty(req.query)) {
			data.query = JSON.stringify(req.query, null, '  ');
		}
		if (!_.isEmpty(req.body)) {
			data.body = JSON.stringify(req.body, null, '  ');
		}
		data = _.isEmpty(data) ? '' : data;
		logger.debug('--------------------------------');
		logger.debug(req.method, req.path, data);

		next();
	});
}

app.use('/', clientRoutes);

app.use(bodyParser.json());
app.use('/v1', routes);

module.exports = app;
