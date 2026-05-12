import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorResponse: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        errorResponse = res;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma error masking - prevent leaking DB schema/internals
      status = HttpStatus.BAD_REQUEST;
      switch (exception.code) {
        case 'P2002':
          message = 'A record with this data already exists.';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found.';
          break;
        default:
          message = 'Database operation failed.';
      }
    } else {
      // Phase 23: Structured Observability Logging for Sentry/Datadog/BetterStack
      const errorPayload = {
        level: 'error',
        message: (exception as Error)?.message || 'Unknown Error',
        stack: (exception as Error)?.stack,
        context: {
          method: request.method,
          url: request.url,
          body: request.body,
          ip: request.ip,
          userAgent: request.get('user-agent'),
        },
        timestamp: new Date().toISOString(),
      };
      
      this.logger.error(JSON.stringify(errorPayload));
    }

    // Known errors or safe HttpExceptions can log safely without stack traces
    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.warn(`[${request.method}] ${request.url} - Status: ${status} - Error: ${message}`);
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
