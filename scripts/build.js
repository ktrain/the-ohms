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
	.then(() => {
		const browserify = require('browserify');
		const babelify = require('babelify');
		const fs = require('fs');
		const uglify = require('uglify-js');

		return new Promise((resolve, reject) => {
			browserify({})
				.require(project.libs)
				.transform(babelify, {
					presets: ['latest'],
					global: true,
				})
				.bundle((err, buf) => {
					if (err) return reject(err);
					let code = buf.toString();
					if (process.env.NODE_ENV === 'production') {
						try {
							code = uglify.minify(buf.toString(), { fromString: true }).code;
						} catch (e) {
							return reject(e);
						}
					}
					fs.writeFile('build/libs.js', code, (err) => {
						if (err) return reject(err);
						return resolve();
					});
				});
		});
	})
	.then(jsx('main', './client/main/main.jsx', project.libs, [project.clientDir]))
	.then(less('main', project.clientDir))
	.then(assets(project.assets, [project.clientDir]))
	.then(console.time.bind(console, label))
	.catch(console.error);
