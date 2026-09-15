import app, { databaseReady } from './app.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 4000;

try {
  await databaseReady;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
} catch (error) {
  logger.error(`Server startup aborted: ${error.message}`, {
    errorName: error.name,
    stack: error.stack,
  });
  process.exit(1);
}
