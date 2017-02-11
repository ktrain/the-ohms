'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const logger = require('src/util/logger.js')('routing');
const routes = require('./routes.js');
const clientRoutes = require('./client.js');

app.use((req, res, next) => {
	let data = {};
	if (!_.isEmpty(req.query)) {
		data.query = JSON.stringify(req.query, null, '  ');
	}
	if (!_.isEmpty(req.body)) {
		data.body = JSON.stringify(req.body, null, '  ');
	}
	data = _.isEmpty(data) ? '' : data;
	logger.debug(req.method, req.path, data);
	next();
});

app.use('/', clientRoutes);

app.use(bodyParser.json());
app.use('/v1', routes);

module.exports = app;
