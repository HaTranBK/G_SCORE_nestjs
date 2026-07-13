import { CustomException } from './custom-exception';
import { HttpStatus } from '@nestjs/common';

export interface ErrorRegistryEntry {
  code: string;
  message: string;
  status: HttpStatus;
}

export type ErrorRegistry = Record<string, ErrorRegistryEntry>;

/**
 * Converts Result errors to CustomException for controller throwing
 *
 * @param error - Error from Result.error
 * @param errorRegistry - Optional error code registry for mapping known errors
 * @returns CustomException instance
 */
export function toException(
  error: Error,
  errorRegistry?: ErrorRegistry,
): CustomException {
  if (error instanceof CustomException) {
    return error;
  }
  if (errorRegistry) {
    for (const [key, entry] of Object.entries(errorRegistry)) {
      // Match if error message contains the registry key
      if (error.message.includes(key)) {
        return new CustomException(entry.code, entry.message, entry.status);
      }
    }
  }

  return new CustomException(
    'INTERNAL_ERROR',
    error.message,
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
