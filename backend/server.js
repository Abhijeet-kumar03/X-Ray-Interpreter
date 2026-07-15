'use strict';

require('dotenv').config();

const app                                = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');
const env    = require('./src/config/environment');
const logger = require('./src/utils/logger');

/**
 * Bootstrap the MedVision AI server.
 *
 * Order matters:
 *   1. Connect to MongoDB
 *   2. Start listening on the configured port
 *   3. Register signal handlers for graceful shutdown
 */
async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.server.port, () => {
      console.log('');
      console.log('  🏥  MedVision AI — Medical Diagnostic Platform');
      console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  ✅  Server     : http://localhost:${env.server.port}`);
      console.log(`  📡  Environment: ${env.nodeEnv}`);
      console.log(`  🔗  API Base   : http://localhost:${env.server.port}/api`);
      console.log(`  🩺  Health     : http://localhost:${env.server.port}/health`);
      console.log(`  🧠  AI Pipeline: v${env.ai.pipelineVersion}`);
      console.log(`  🤖  Default Model: ${env.ai.defaultModel}`);
      console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

    // ── Graceful shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);

      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server and database connections closed. Goodbye.');
        process.exit(0);
      });

      // Force exit if graceful close takes too long
      setTimeout(() => {
        logger.error('Shutdown timed out — forcing exit');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // ── Unhandled rejections / exceptions ────────────────────────────────────
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection', { reason: String(reason) });
      // Don't exit — let the request fail naturally and keep the server alive
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception — shutting down', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Server failed to start', { error: error.message });
    process.exit(1);
  }
}

bootstrap();
