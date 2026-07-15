'use strict';

/**
 * Centralized environment configuration.
 *
 * All environment variables are read and normalised here.
 * Import this module — never read process.env directly elsewhere.
 */
const environment = {
  nodeEnv:       process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction:  process.env.NODE_ENV === 'production',
  isTest:        process.env.NODE_ENV === 'test',

  server: {
    port:       parseInt(process.env.PORT, 10) || 5000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  db: {
    uri:                     process.env.MONGODB_URI || 'mongodb://localhost:27017/medvision-ai',
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS, 10) || 10000,
    socketTimeoutMS:          parseInt(process.env.DB_SOCKET_TIMEOUT_MS, 10)           || 45000,
  },

  auth: {
    jwtSecret:                process.env.JWT_SECRET                                    || 'change-me-in-production',
    jwtExpiresIn:             process.env.JWT_EXPIRES_IN                                || '7d',
    refreshTokenExpiresInDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 10)    || 30,
    passwordResetExpiresMin:   parseInt(process.env.PASSWORD_RESET_EXPIRES_MIN, 10)    || 60,
    bcryptSaltRounds:          parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)            || 12,
  },

  upload: {
    dir:         process.env.UPLOAD_DIR                                || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10)              || 10 * 1024 * 1024, // 10 MB
  },

  ai: {
    defaultModel:    process.env.AI_DEFAULT_MODEL    || 'DenseNet121',
    defaultModality: process.env.AI_DEFAULT_MODALITY || 'chest_xray',
    pipelineVersion: '3.0.0',
    // Optional: URL of an external Python model microservice
    modelServiceUrl: process.env.AI_MODEL_SERVICE_URL || null,
  },

  cache: {
    driver:     process.env.CACHE_DRIVER                              || 'memory', // 'memory' | 'redis'
    redisUrl:   process.env.REDIS_URL                                 || 'redis://localhost:6379',
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10)          || 300,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max:      parseInt(process.env.RATE_LIMIT_MAX, 10)        || 100,
  },
};

module.exports = environment;
