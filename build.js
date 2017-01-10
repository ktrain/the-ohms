'use strict';

const label = 'build';
console.time(label);

const cleanStep = require('vitreum/steps/clean');
const jsxStep = require('vitreum/steps/jsx').partial;
const libsStep = require('vitreum/steps/libs').partial;
const lessStep = require('vitreum/steps/less').partial;
const assetStep = require('vitreum/steps/assets').partial;

const project = require('./project.json');

cleanStep()
	.then(libsStep(project.libs))
	.then(jsxStep('main', './client/main/main.jsx', project.libs))
	.then(lessStep('main', project.shared))
	.then(assetStep(project.assets, ['./client']))
	.then(console.time.bind(console, label))
	.catch(console.error);
