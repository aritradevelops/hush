import { sanitize } from 'class-sanitizer';
import { plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator-custom-errors';
import { Env as EnvSchema } from '../schemas/env';
import logger from '../utils/logger';

class Env {
  #vars: EnvSchema;
  constructor() {
    const instance = plainToInstance(EnvSchema, process.env);
    const errors = validateSync(instance);
    if (errors.length) {
      logger.error(`Env variables are missing or contains invalid values`);
      logger.error(errors);
      process.exit(1);
    }
    sanitize(instance);
    this.#vars = instance;
  }
  get<T extends keyof EnvSchema>(key: T) {
    return this.#vars[key] as EnvSchema[T];
  }
}

export default new Env();