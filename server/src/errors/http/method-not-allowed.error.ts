import { HttpError } from "../http.error";

export class MethodNotAllowedError extends HttpError {
  constructor(message?: string, devErrorCode?: number) {
    super(message, 405, devErrorCode);
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
  }
}