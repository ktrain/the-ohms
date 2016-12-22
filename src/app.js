'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.status(200).send({ message: 'Welcome to The Ohms. Can you resist?' });
});

module.exports = app;
