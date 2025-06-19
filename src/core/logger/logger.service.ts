import { injectable } from 'inversify';
import { ILogger } from './logger.interface';
import { LogLevel, LogEntry, LoggerConfig } from './types';
import { LogFormatters } from './formatters';
import { BaseError } from '@/shared/errors/BaseError';


@injectable()
export class LoggerService implements ILogger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: this.getLogLevel(),
      service: 'ecommerce-backend',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    // Development: Only warnings and errors by default
    if (process.env.NODE_ENV === 'development') {
      return LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.WARN;
    }
    
    // Production: Info level by default
    return LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private createLogEntry(level: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      service: this.config.service
    };
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(levelName, message, data);
    if (this.config.environment === 'development') {
      LogFormatters.development(entry);
    } else {
      LogFormatters.production(entry);
    }
  }

  /**
   * Smart error method that handles both BaseError and regular Error
   */
  error(message: string, error?: Error, data?: any): void {
    let logData: any = { ...data };

    if (error) {
      // Check if it's a BaseError using instanceof
      if (error instanceof BaseError) {
        // Use BaseError's rich logging data
        const baseErrorData = error.getLogData();
        logData = {
          ...baseErrorData,
          ...data // Allow additional data to override if needed
        };
      } else {
        // Standard Error handling
        logData = {
          ...logData,
          error: error.message,
          stack: error.stack,
          name: error.name
        };
      }
    }

    this.log(LogLevel.ERROR, 'error', message, logData);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'warn', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'info', message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, data);
  }
}