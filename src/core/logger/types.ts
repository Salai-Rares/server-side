export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  service: string;
  requestId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  service: string;
  environment: string;
}