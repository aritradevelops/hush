import { HttpError } from "../http.error";

export class BadRequestError extends HttpError {
  constructor(message?: string, devErrorCode?: number) {
    super(message, 400, devErrorCode);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
