export abstract class HttpError extends Error {
  stackTrace?: string;
  constructor(
    message?: string,
    public status: number = 500,
    public devErrorCode?: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  override get message() {
    return super.message;
  }

  render(): { message: string; field?: string; }[] {
    return [{
      message: this.message,
    }];
  }
}
