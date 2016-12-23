'use strict';

const Handler = {

	handleMessage: (message) => {
		return new Promise((resolve, reject) => {
			let parsedMessage;
			try {
				parsedMessage = JSON.parse(message);
			} catch (err) {
				return reject(new Error(`Could not JSON.parse incoming ws message: ${message}`));
			}

			if (!parsedMessage.type) {
				return reject(new Error(`Incoming ws message has no type: ${message}`));
			}

			switch (parsedMessage.type) {
				case 'start':
					break;
				default:
					return reject(new Error(`Incoming message has unknown type: ${message}`));
			}

			return resolve();
		});
	},

};

module.exports = Handler;
