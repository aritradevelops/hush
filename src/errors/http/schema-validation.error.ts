import type { ValidationError } from "class-validator-custom-errors";
import { HttpError } from "../http.error";

export class SchemaValidationError extends HttpError {
  constructor(public errs: ValidationError[], devErrorCode?: number) {
    super('', 400, devErrorCode);
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }
  render(): { message: string; field?: string; }[] {
    return this.errs.map(err => ({ message: Object.values(err.constraints!).join(' '), field: err.property }));
  }
}