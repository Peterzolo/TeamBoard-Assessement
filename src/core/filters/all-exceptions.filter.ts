import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // Default status/message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as any).name === 'ValidationError'
    ) {
      // Mongoose ValidationError → 400 with field messages
      status = HttpStatus.BAD_REQUEST;
      const errors = (exception as any).errors || {};
      const details = Object.keys(errors).map((k) => errors[k]?.message || k);
      message = details.length ? details : 'Validation failed';
    }

    // This handles cases where class-validator returns a complex object
    const errorMessage =
      typeof message === 'object'
        ? (message as any).message || message
        : message;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
    };

    this.logger.error(
      `[${request.method}] ${request.url} >> ${status} >> message: ${JSON.stringify(errorMessage)}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(status).json(errorResponse);
  }
}
