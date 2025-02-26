import { HttpError } from "../http.error";

export class InternalServerError extends HttpError {
  constructor(message?: string, devErrorCode?: number) {
    super(message, 500, devErrorCode);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
