'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const routes = require('./routes.js');

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.status(200).send({ message: 'Welcome to The Ohms. Can you resist?' });
});

app.use('/v1', routes);

module.exports = app;
