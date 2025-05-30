import { ErrorContext } from "./error-context.base";

export interface SystemContextData {
  componentName?: string;
  operationName?: string;
  includeSystemMetrics?: boolean;
  configPath?: string;
  serviceName?: string;
  serviceVersion?: string;
  deploymentEnvironment?: string;
  hostName?: string;
  containerId?: string;
}

export class SystemErrorContext extends ErrorContext {
  private readonly _componentName?: string;
  private readonly _operationName?: string;
  private readonly _includeSystemMetrics: boolean;
  private readonly _configPath?: string;
  private readonly _serviceName?: string;
  private readonly _serviceVersion?: string;
  private readonly _deploymentEnvironment?: string;
  private readonly _hostName?: string;
  private readonly _containerId?: string;

  constructor(data: SystemContextData = {}) {
    super('system');
    this._componentName = data.componentName;
    this._operationName = data.operationName;
    this._includeSystemMetrics = data.includeSystemMetrics ?? false;
    this._configPath = data.configPath;
    this._serviceName = data.serviceName || process.env.SERVICE_NAME;
    this._serviceVersion = data.serviceVersion || process.env.SERVICE_VERSION;
    this._deploymentEnvironment = data.deploymentEnvironment || process.env.NODE_ENV;
    this._hostName = data.hostName;
    this._containerId = data.containerId || process.env.CONTAINER_ID;
  }

  // Getters
  public get componentName(): string | undefined { return this._componentName; }
  public get operationName(): string | undefined { return this._operationName; }
  public get serviceName(): string | undefined { return this._serviceName; }
  public get serviceVersion(): string | undefined { return this._serviceVersion; }

  public toLogData(): Record<string, any> {
    const baseData = {
      contextType: this._contextType,
      timestamp: this._timestamp.toISOString(),
      componentName: this._componentName,
      operationName: this._operationName,
      configPath: this._configPath,
      serviceName: this._serviceName,
      serviceVersion: this._serviceVersion,
      deploymentEnvironment: this._deploymentEnvironment,
      hostName: this._hostName,
      containerId: this._containerId,
    };

    if (this._includeSystemMetrics) {
      return {
        ...baseData,
        systemMetrics: this.getSystemMetrics(),
      };
    }

    return baseData;
  }

  public getSummary(): string {
    const parts = [
      this._componentName,
      this._operationName && `op:${this._operationName}`,
      this._serviceName && `svc:${this._serviceName}`,
    ].filter(Boolean);

    return `System Context(${parts.join(', ')})`;
  }

  private getSystemMetrics(): Record<string, any> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  }

  /**
   * Creates system context for configuration operations
   */
  static forConfiguration(configPath?: string): SystemErrorContext {
    return new SystemErrorContext({
      componentName: 'configuration',
      operationName: 'load_config',
      configPath,
      includeSystemMetrics: true,
    });
  }

  /**
   * Creates system context for database operations
   */
  static forDatabase(operation: string): SystemErrorContext {
    return new SystemErrorContext({
      componentName: 'database',
      operationName: operation,
      includeSystemMetrics: false,
    });
  }

  /**
   * Creates system context for service startup
   */
  static forStartup(serviceName?: string): SystemErrorContext {
    return new SystemErrorContext({
      componentName: 'startup',
      operationName: 'initialize',
      serviceName,
      includeSystemMetrics: true,
    });
  }
}
