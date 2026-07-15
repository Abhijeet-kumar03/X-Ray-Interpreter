'use strict';

const env = require('../config/environment');
const logger = require('../utils/logger');

/**
 * In-memory cache with TTL support.
 * Drop-in replacement for Redis when Redis is not available.
 * The CacheService interface is identical regardless of driver.
 */
class MemoryCache {
  constructor() {
    this._store = new Map();
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this._store.set(key, { value, expiresAt });
  }

  async del(key) {
    this._store.delete(key);
  }

  async flush() {
    this._store.clear();
  }
}

// ── Singleton cache instance ───────────────────────────────────────────────
let cacheInstance = null;

function getCacheInstance() {
  if (cacheInstance) return cacheInstance;

  if (env.cache.driver === 'redis') {
    // Redis adapter can be plugged in here when redis is installed.
    // For now, fall back to memory cache with a warning.
    logger.warn('Redis cache configured but not yet implemented — using in-memory cache.');
  }

  cacheInstance = new MemoryCache();
  logger.info('Cache initialized', { driver: 'memory' });
  return cacheInstance;
}

const cacheService = {
  async get(key) {
    return getCacheInstance().get(key);
  },

  async set(key, value, ttlSeconds = env.cache.ttlSeconds) {
    return getCacheInstance().set(key, value, ttlSeconds);
  },

  async del(key) {
    return getCacheInstance().del(key);
  },

  async flush() {
    return getCacheInstance().flush();
  },
};

module.exports = cacheService;
