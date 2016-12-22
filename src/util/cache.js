'use strict';

const _      = require('lodash');
const config = require('nconf');
const randomstring = require('randomstring');
const redis = require('redis');

const redisUrl = config.get('redis_url');
const cacheConfig = config.get('cache');

if (!redisUrl && !cacheConfig) {
    throw new Error('Cache is not configured properly. '
            + 'Please check `config.cache`, or set `REDIS_URL` env var.');
}

let redisClient;
if (redisUrl) {
    redisClient = redis.createClient(redisUrl);
} else {
    if (!cacheConfig.password) {
        delete cacheConfig.password;
    }
    redisClient = redis.createClient(cacheConfig);
}

const attemptJsonParse = (jsonMaybe) => {
    let val = jsonMaybe;
    try {
        val = JSON.parse(val);
    } catch (err) {
        // value is not JSON
        // that's ok; just ignore the error and send back the value
    }
    return val;
};

const parseHash = (hash) => {
    return _.map(_.values(hash), attemptJsonParse);
};

const Cache = {

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

            redisClient.set(key, val, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }
                resolve(res);
            });
        });
    },

    hashPut: (hashKey, value) => {
        return new Promise((resolve, reject) => {
            const val = Cache.prepValue(value);
            const hashField = randomstring.generate({
                length: config.get('cache:hashFieldLength'),
                charset: 'alphanumeric',
            });

            redisClient.hset(hashKey, hashField, val, (err, success) => {
                if (err) {
                    return reject(new Error(err));
                }
                resolve(!!success);
            });
        });
    },

    get: (key) => {
        return new Promise((resolve, reject) => {
            redisClient.get(key, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }

                resolve(attemptJsonParse(res));
            });
        });
    },

    hashGet: (hashKey) => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall(hashKey, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }
                resolve(attemptJsonParse(res));
            });
        });
    },

    // promise gets resolved with the number of items deleted
    del: (key) => {
        return new Promise((resolve, reject) => {
            redisClient.del(key, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }
                resolve(res);
            });
        });
    },

    hashDel: (hashKey) => {
        return new Promise((resolve, reject) => {
            redisClient.hdel(hashKey, (err, res) => {
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
            redisClient.multi()
                .get(key)
                .del(key)
                .exec((err, replies) => {
                    if (err) {
                        return reject(new Error(err));
                    }
                    const getResult = replies[0];
                    resolve(attemptJsonParse(getResult));
                });
        });
    },

    hashGetAndDel: (hashKey) => {
        return new Promise((resolve, reject) => {
            redisClient.multi()
                .hgetall(hashKey)
                .del(hashKey)
                .exec((err, replies) => {
                    if (err) {
                        return reject(new Error(err));
                    }
                    const hash = replies[0];
                    resolve(parseHash(hash));
                });
        });
    },

    getRawClientYesIKnowWhatImDoing: () => {
        return redisClient;
    },
};

module.exports = Cache;

