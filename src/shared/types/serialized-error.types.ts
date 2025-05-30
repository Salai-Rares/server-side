import { ErrorContext } from "../errors/error-context/error-context.base";
import { ValidationField } from "../errors/ValidationError";


export interface SerializedError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: any;
  context?: Record<string,any>;
  stack?: string;
  cause?: {
    message: string;
    stack?: string;
  };
}


