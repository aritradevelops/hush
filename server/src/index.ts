import 'dotenv/config';
import 'reflect-metadata';

import { createServer } from "http";
import app from "./app";
import db from "./lib/db";
import env from "./lib/env";
import hookManager from "./lib/hook-manager";
import socketIO from './socket-io';
import logger from "./utils/logger";

const httpServer = createServer(app);



const server = httpServer.listen(env.get('PORT'), async () => {
  await db.init();
  await hookManager.init();
  socketIO.init(httpServer)
  if (env.get('NODE_ENV') === 'development') {
    const { Swagger } = require('./utils/swagger');
    Swagger.generate();
  }
  logger.info(`Server is running on port ${env.get('PORT')}`);
});

async function shutDown() {
  server.close(async err => {
    socketIO.close();
    await db.close();
    logger.notice('Server gracefully shutting down');

    logger.info(`Server stopped successfully`)
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
