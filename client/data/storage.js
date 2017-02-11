'use strict';

const _ = require('lodash');

const logger = require('data/logger');


const Storage = {

	prepValue: (value) => {
		let val = value;
		if (!_.isString(val)) {
			val = JSON.stringify(val);
		}
		return val;
	},

	attemptJsonParse: (jsonMaybe) => {
		let val = jsonMaybe;
		try {
			val = JSON.parse(val);
		} catch (err) {
			// value is not JSON; that's ok
		}
		return val;
	},

	put: (key, val) => {
		const preppedVal = Storage.prepValue(val);
		localStorage.setItem(key, preppedVal);
		logger.debug('STORAGE:PUT', key, preppedVal);
		return val;
	},

	get: (key) => {
		if (typeof localStorage === 'undefined') {
			return null;
		}
		const val = localStorage.getItem(key);
		const parsedVal = Storage.attemptJsonParse(val);
		logger.debug('STORAGE:GET', key, parsedVal);
		return parsedVal;
	},

	del: (key) => {
		const val = Storage.get(key);
		localStorage.removeItem(key);
		return val;
	},

};

module.exports = Storage;
