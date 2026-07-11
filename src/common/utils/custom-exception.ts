import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  public readonly errorCode: string;

  constructor(
    code: string,
    message: string,
    status: HttpStatus,
    metadata?: Record<string, unknown>,
  ) {
    super({ code, message, ...(metadata && { metadata }) }, status);
    this.errorCode = code;
  }
}
