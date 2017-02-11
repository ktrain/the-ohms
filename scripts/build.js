'use strict';

const label = 'build';
console.time(label);

const clean = require('vitreum/steps/clean');
const jsx = require('vitreum/steps/jsx').partial;
const libs = require('vitreum/steps/libs').partial;
const less = require('vitreum/steps/less').partial;
const assets = require('vitreum/steps/assets').partial;

const project = require('./project.json');

clean()
	.then(libs(project.libs))
	.then(jsx('main', './client/main/main.jsx', project.libs, [project.clientDir]))
	.then(less('main', project.clientDir))
	.then(assets(project.assets, [project.clientDir]))
	.then(console.time.bind(console, label))
	.catch(console.error);
