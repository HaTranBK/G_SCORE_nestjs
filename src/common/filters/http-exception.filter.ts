import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomException } from '../utils/custom-exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    let code = 'HTTP_ERROR';
    let message = exception.message;
    let errors: unknown = undefined;

    if (exception instanceof CustomException) {
      code = exception.errorCode;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      if (resp.code) code = resp.code as string;
      if (resp.message) {
        message = Array.isArray(resp.message)
          ? (resp.message as string[]).join(', ')
          : (resp.message as string);
      }
      if (resp.errors) errors = resp.errors;

      // class-validator sends message as array
      if (Array.isArray(resp.message)) {
        errors = resp.message;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
      }
    }

    if (status === HttpStatus.UNAUTHORIZED && code === 'HTTP_ERROR') {
      code = 'UNAUTHORIZED';
    } else if (status === HttpStatus.FORBIDDEN && code === 'HTTP_ERROR') {
      code = 'FORBIDDEN';
    } else if (status === HttpStatus.NOT_FOUND && code === 'HTTP_ERROR') {
      code = 'NOT_FOUND';
    }

    response.status(status).json({
      code,
      message,
      ...(errors !== undefined && { errors }),
    });
  }
}
