import { HttpError } from "../http.error";

export class NotFoundError extends HttpError {
  constructor(message?: string, devErrorCode?: number) {
    super(message, 404, devErrorCode);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}