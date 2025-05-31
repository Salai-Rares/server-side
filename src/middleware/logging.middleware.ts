import { Request, Response, NextFunction } from 'express';
import { container } from '../container';
import { TYPES } from '../shared/types';
import { ILogger } from '../core/logger/logger.interface';

export function expressLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Get logger from container
  const logger = container.get<ILogger>(TYPES.Logger);
  
  const start = Date.now();
  const method = req.method;
  const path = req.path;

  // Store start time for ErrorLogger to use if needed
  (req as any).__requestStart = start;

  logger.debug('Request started', {
    method, path, ip: req.ip, userAgent: req.get('user-agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Only log successful requests and redirects
    // ErrorLogger handles 400+ status codes
    if (statusCode >= 300 && statusCode < 400) {
      logger.warn('Request redirected', {
        method, path, statusCode, duration, ip: req.ip
      });
    } else if (statusCode >= 200 && statusCode < 300) {
      logger.info('Request completed', {
        method, path, statusCode, duration, ip: req.ip
      });
    }
  });

  next();
}