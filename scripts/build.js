'use strict';

const label = 'build';
console.time(label);

const steps = require('vitreum/steps');
const project = require('./project.json');

steps.clean()
	.then(() => steps.libs(project.libs))
	.then(() => steps.jsx('main', './client/main/main.jsx', { libs: project.libs, shared: [project.clientDir] }))
	.then((deps) => steps.less('main', { shared: [project.clientDir] }, deps))
	.then(() => steps.assets(project.assets, [project.clientDir]))
	.then(() => console.timeEnd(label))
	.catch(console.error);
