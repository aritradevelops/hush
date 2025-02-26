import 'dotenv/config';
import 'reflect-metadata';

import app from "./app";
import db from "./lib/db";
import env from "./lib/env";
import hookManager from "./lib/hook-manager";
import logger from "./utils/logger";
import { Swagger } from './utils/swagger';
import { createServer } from "http";
import { Server } from 'socket.io';
import { registerSocketHandler } from './socket';
const httpServer = createServer(app);

const io = new Server(httpServer, {});
registerSocketHandler(io);
const server = httpServer.listen(env.get('PORT'), async () => {
  await db.init();
  await hookManager.init();
  if (env.get('NODE_ENV') === 'development')
    Swagger.generate();
  logger.info(`Server is running on port ${env.get('PORT')}`);
});

async function shutDown() {
  await db.close();
  logger.notice('Server gracefully shutting down');
  server.close(err => {
    logger.info(`Server stopped successfully`)
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
