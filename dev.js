'use strict';

const label = 'dev';
console.time(label);

const jsx = require('vitreum/steps/jsx.watch');
const less = require('vitreum/steps/less.watch').partial;
const assets = require('vitreum/steps/assets.watch').partial;
const server = require('vitreum/steps/server.watch').partial;
const livereload = require('vitreum/steps/livereload').partial;

const project = require('./project.json');

jsx('main', './client/main/main.jsx', project.libs)
	.then(less('main', null))
	.then(assets(project.assets, ['./client']))
	.then(livereload('main'))
	.then(server('./src/main.js', ['./src']))
	.then(console.timeEnd.bind(console, label))
	.catch(console.error);
