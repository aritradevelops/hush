import type { PrimaryColumn } from "typeorm";
import type { PrimaryColumns } from "./primary-columns";
import type Service from "./service";
import { plainToInstance } from "class-transformer";
import { sanitize, sanitizeAsync } from "class-sanitizer";
import { validateOrReject } from "class-validator-custom-errors";
import type { ValidationError } from "class-validator";
import { SchemaValidationError } from "../errors/http/schema-validation.error";

export default class Controller<U extends typeof PrimaryColumns = typeof PrimaryColumns, V extends Service = Service> {
  constructor(protected service: V, protected schema: U) { }
  protected async _validate(data: any, t: Function, partial = false, groups: string[] = []) {
    const instance = plainToInstance(this.schema, data, {
      excludeExtraneousValues: true,
    }) as InstanceType<U>;
    const sanitized = await sanitizeAsync(instance);
    try {
      await validateOrReject(sanitized, {
        stopAtFirstError: true,
        whitelist: true,
        validationError: {
          transformFunction: (key: string) => t(`validation.${key}`)
        },
        skipMissingProperties: partial,
        skipUndefinedProperties: partial
      });
      return sanitized;
    } catch (error) {
      throw new SchemaValidationError(error as ValidationError[]);
    }
  }
}