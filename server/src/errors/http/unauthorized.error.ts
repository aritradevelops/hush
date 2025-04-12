import { HttpError } from "../http.error";

export class UnauthorizedError extends HttpError {
  constructor(message?: string, devErrorCode?: number) {
    super(message, 403, devErrorCode);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
