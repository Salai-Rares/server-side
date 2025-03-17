export class BaseError extends Error {
  private readonly _statusCode: number;
  private readonly _isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    this._statusCode = statusCode;
    this._isOperational = isOperational;
    Error.captureStackTrace(this);
  }

  public get statusCode(): number{
    return this._statusCode;
  }
  public get isOperational() : boolean{
    return this._isOperational;
  }
}


