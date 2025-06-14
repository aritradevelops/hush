import { DataSource, type EntityTarget, type ObjectLiteral } from "typeorm";
import { applySearchTriggers } from "../utils/apply-search-triggers";
import logger from "../utils/logger";
import env from "./env";
import { applySlugTriggers } from "../utils/apply-slug-triggers";

export class Db {
  private dataSource!: DataSource;
  async init(): Promise<void> {
    this.dataSource = new DataSource({
      type: "postgres",
      host: env.get('DB_HOST'),
      port: env.get('DB_PORT'),
      username: env.get('DB_USERNAME'),
      password: env.get('DB_PASSWORD'),
      database: env.get('DB_NAME'),
      entities: [`./${env.get('ROOT')}/entities/**/*.${env.get('EXT')}`],
      logging: env.get('NODE_ENV') !== 'production',
      logger: "file",
      // synchronize: true,
      migrations: [`./${env.get('ROOT')}/migrations/**/*.${env.get('EXT')}`],
    });
    await this.dataSource.initialize();
    await this.dataSource.runMigrations();
    await applySearchTriggers(this.dataSource);
    await applySlugTriggers(this.dataSource);
    logger.info('Database initialized successfully');
  }
  async close(): Promise<void> {
    await this.dataSource.destroy();
    logger.notice('Database connection closed');
  }

  getManager() {
    return this.dataSource.manager
  }

  async healthCheck() {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      logger.critical("Database Connection Error");
      return false;
    }
  }
  entities() {
    return this.dataSource.entityMetadatas.map(e => e.name);
  }
}

export default new Db();