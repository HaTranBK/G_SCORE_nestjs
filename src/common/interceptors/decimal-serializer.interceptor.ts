import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function transformDecimals(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // Convert Date objects to ISO strings
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Prisma Decimal has toNumber() and a special constructor name
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof value.toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  if (Array.isArray(value)) {
    return value.map(transformDecimals);
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = transformDecimals((value as Record<string, unknown>)[key]);
    }
    return result;
  }

  return value;
}

@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        return {
          code: 'SUCCESS',
          message: 'Success',
          data: transformDecimals(data),
        };
      }),
    );
  }
}
