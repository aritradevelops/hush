import { HttpError } from "../http.error";

export class UnauthenticatedError extends HttpError {
  constructor(message?: string, devErrorCode?: number) {
    super(message, 401, devErrorCode);
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}
