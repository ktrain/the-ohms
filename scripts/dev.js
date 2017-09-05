'use strict';

const label = 'dev';
console.time(label);

const steps = require('vitreum/steps');
const project = require('./project.json');

return steps.jsxWatch('main', './client/main/main.jsx', { libs: project.libs, shared: [project.clientDir] })
	.then((deps) => steps.lessWatch('main', { shared: [project.clientDir] }, deps))
	.then(() => steps.assets(project.assets, [project.clientDir]))
	.then(() => steps.livereload('main'))
	.then(() => steps.serverWatch('./src/main.js', ['./src']))
	.then(() => console.timeEnd(label))
	.catch(console.error);
