import { injectable } from "inversify";
import { ApiErrorContext } from "../error-context/api-error-context";
import { Request } from "express";
@injectable()
export class RequestContextBuilder {
  
  /**
   * Builds API context from Express request
   */
  buildFromRequest(req: Request): ApiErrorContext {
    return new ApiErrorContext({
      requestId: this.extractRequestId(req),
      endpoint: `${req.method} ${req.path}`,
      method: req.method as any,
      userAgent: req.headers['user-agent'],
      ip: this.extractClientIp(req),
      userId: this.extractUserId(req),
    //   sessionId: req.sessionID,
      correlationId: req.headers['x-correlation-id'] as string,
      referer: req.headers['referer'],
      origin: req.headers['origin'],
      contentType: req.headers['content-type'],
      acceptLanguage: req.headers['accept-language'],
      authorization: req.headers['authorization']
    });
  }

  private extractRequestId(req: Request): string {
    return (
      req.headers['x-request-id'] as string ||
      req.headers['x-correlation-id'] as string ||
      (req as any).id ||
      this.generateRequestId()
    );
  }

  private extractClientIp(req: Request): string | undefined {
    return (
      req.ip ||
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.socket?.remoteAddress
    );
  }

  private extractUserId(req: Request): string | number | undefined {
    const user = (req as any).user;
    return user?.id || user?._id || user?.userId;
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}