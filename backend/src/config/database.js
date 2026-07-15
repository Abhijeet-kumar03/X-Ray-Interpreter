'use strict';

const mongoose = require('mongoose');
const env    = require('./environment');
const logger = require('../utils/logger');

// Suppress Mongoose 7+ strictQuery deprecation warning
mongoose.set('strictQuery', false);

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: env.db.serverSelectionTimeoutMS,
  socketTimeoutMS:          env.db.socketTimeoutMS,
};

/**
 * Establish and monitor the MongoDB connection.
 *
 * Event listeners are registered BEFORE mongoose.connect() so that they
 * fire correctly even if the initial connection is slow (e.g. Atlas cold start).
 *
 * NOTE: Do NOT set `bufferCommands: false` in development — with cloud databases
 * the connection takes ~1-2 seconds, and disabling buffering causes every model
 * operation that runs before the socket opens to throw immediately.
 */
async function connectDatabase() {
  // ── Register connection event listeners ──────────────────────────────────
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected — Mongoose will attempt to reconnect automatically.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected successfully.');
  });

  // ── Attempt connection ───────────────────────────────────────────────────
  try {
    await mongoose.connect(env.db.uri, CONNECT_OPTIONS);
    logger.info('MongoDB connected', { host: mongoose.connection.host });
  } catch (error) {
    logger.error('MongoDB initial connection failed', { error: error.message });

    if (env.isProduction) {
      // In production a bad DB connection is fatal — let the process manager restart us
      throw error;
    }

    logger.warn(
      '⚠️  Continuing without a live MongoDB connection. ' +
      'All database operations will fail until a connection is established.'
    );
  }
}

/**
 * Gracefully close the MongoDB connection.
 * Call this during server shutdown.
 */
async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
}

module.exports = { connectDatabase, disconnectDatabase };
