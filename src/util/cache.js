'use strict';

const _	  = require('lodash');
const config = require('nconf');
const randomstring = require('randomstring');
const redis = require('ioredis');
const Redlock = require('redlock');

const logger = require('src/util/logger.js')('cache');

const redisUrl = config.get('redis_url');
const cacheConfig = config.get('cache');

let queryClient, subClient, lock;


const Cache = {

    init: (cacheLib=redis) => {

        if (!redisUrl && !cacheConfig) {
            throw new Error('Cache is not configured properly. '
                    + 'Please check `config.cache`, or set `REDIS_URL` env var.');
        }

        queryClient = Cache.createClient(cacheLib);
        subClient = queryClient;

        lock = new Redlock(
            // one client per redis node
            [queryClient],
            {
                driftFactor: config.get('cache:locking:driftFactor'),
                retryCount: config.get('cache:locking:retryCount'),
                retryDelay: config.get('cache:locking:retryDelay'),
            }
        );

        lock.on('clientError', (err) => {
            logger.err('LockError', err);
        });

    },

    createClient: (cacheLib) => {
        let client;
        if (redisUrl) {
            client = new cacheLib(redisUrl);
        } else {
            if (!cacheConfig.password) {
                delete cacheConfig.password;
            }
            client = new cacheLib(cacheConfig);
        }
        return client;
    },

    attemptJsonParse: (jsonMaybe) => {
        let val = jsonMaybe;
        try {
            val = JSON.parse(val);
        } catch (err) {
            // value is not JSON
            // that's ok; just ignore the error and send back the value
        }
        return val;
    },

    parseHash: (hash) => {
        return _.map(_.values(hash), Cache.attemptJsonParse);
    },

	prepValue: (value) => {
		let val = value;
		if (!_.isString(val)) {
			val = JSON.stringify(val);
		}
		return val;
	},

	put: (key, value) => {
		return new Promise((resolve, reject) => {
			const val = Cache.prepValue(value);

			queryClient.set(key, val, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(value);
			});
		});
	},

	hashPut: (hashKey, value, key) => {
		return new Promise((resolve, reject) => {
			const val = Cache.prepValue(value);
			const hashField = key || randomstring.generate({
				charset: 'alphanumeric',
			});

			queryClient.hset(hashKey, hashField, val, (err) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(value);
			});
		});
	},

	get: (key) => {
		return new Promise((resolve, reject) => {
			queryClient.get(key, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}

				resolve(Cache.attemptJsonParse(res));
			});
		});
	},

	hashGet: (hashKey, key) => {
		if (!key) {
			return Cache.hashGetAll(hashKey);
		}

		return new Promise((resolve, reject) => {
			queryClient.hget(hashKey, key, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(Cache.attemptJsonParse(res));
			});
		});
	},

	hashGetAll: (hashKey) => {
		return new Promise((resolve, reject) => {
			queryClient.hgetall(hashKey, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(Cache.attemptJsonParse(res));
			});
		});
	},

	// promise gets resolved with the number of items deleted
	del: (key) => {
		return new Promise((resolve, reject) => {
			queryClient.del(key, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(res);
			});
		});
	},

	hashDel: (hashKey) => {
		return new Promise((resolve, reject) => {
			queryClient.hdel(hashKey, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(res);
			});
		});
	},

	// atomically get and delete the data at `key`
	getAndDel: (key) => {
		return new Promise((resolve, reject) => {
			queryClient.multi()
				.get(key)
				.del(key)
				.exec((err, [getResult, delResult]) => {
					if (err) {
						return reject(new Error(err));
					}
					resolve(Cache.attemptJsonParse(getResult));
				});
		});
	},

	hashGetAndDel: (hashKey, key) => {
		return new Promise((resolve, reject) => {
			queryClient.multi()
				.hget(hashKey, key)
				.hdel(hashKey, key)
				.exec((err, [hash]) => {
					if (err) {
						return reject(new Error(err));
					}
					resolve(Cache.parseHash(hash));
				});
		});
	},

	prepareLockKey: (key) => {
		return `lock-${key}`;
	},

	acquireLock: (key) => {
		const lockKey = Cache.prepareLockKey(key);
		return lock.lock(lockKey, config.get('cache:locking:lockTTLms'));
	},

	keys: (pattern) => {
		return new Promise((resolve, reject) => {
			queryClient.keys(pattern, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(res);
			});
		});
	},

	getAll: (keys) => {
		if (_.isEmpty(keys)) {
			return Promise.resolve([]);
		}
		return new Promise((resolve, reject) => {
			queryClient.mget(keys, (err, res) => {
				if (err) {
					return reject(new Error(err));
				}
				resolve(_.map(res, Cache.attemptJsonParse));
			});
		});
	},

	getSubscriptionConnection: () => {
		return subClient;
	},

	expire: (key, expirySeconds) => {
		return new Promise((resolve, reject) => {
			queryClient.expire(key, expirySeconds, (err) => {
				if (err) {
					return reject(new Error(err));
				}
				return resolve();
			});
		});
	},

	getRawClientYesIKnowWhatImDoing: () => {
		return queryClient;
	},
};

module.exports = Cache;

