const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 2000);
  }
});

redis.on('connect', () => {
  console.log('⚡ Redis cache connected successfully.');
});

redis.on('error', (err) => {
  console.warn('⚠️ Redis connection warning (Fallback active, proceeding with SQLite):', err.message);
});

module.exports = redis;