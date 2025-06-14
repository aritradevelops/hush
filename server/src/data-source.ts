import "reflect-metadata";
import "dotenv/config"
import { DataSource } from "typeorm";
// import env from "./lib/env";


export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`./src/entities/**/*.ts`],
  logging: process.env.NODE_ENV !== 'production',
  logger: "file",
  // synchronize: true,
  migrations: [`./src/migrations/**/*.ts`],
});