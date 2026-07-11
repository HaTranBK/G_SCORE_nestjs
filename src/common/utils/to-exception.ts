import { CustomException } from './custom-exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Error registry entry structure
 */
export interface ErrorRegistryEntry {
  code: string;
  message: string;
  status: HttpStatus;
}

/**
 * Error registry type (e.g., DISPATCH_ERRORS, BASE_ERRORS)
 */
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
  // Already CustomException → pass through
  if (error instanceof CustomException) {
    return error;
  }

  // Try to map error message to registry codes
  if (errorRegistry) {
    for (const [key, entry] of Object.entries(errorRegistry)) {
      // Match if error message contains the registry key
      if (error.message.includes(key)) {
        return new CustomException(entry.code, entry.message, entry.status);
      }
    }
  }

  // Fallback: map generic errors to INTERNAL_ERROR
  return new CustomException(
    'INTERNAL_ERROR',
    error.message,
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
