import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * CSRF Protection Guard
 * Note: For REST APIs with JWT tokens, CSRF protection is typically not needed
 * as CSRF attacks target cookie-based authentication. However, this guard
 * can be used for additional security if needed.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // For POST/PUT/PATCH/DELETE, check CSRF token
    const csrfToken = request.headers['x-csrf-token'] as string;
    const sessionToken = (request as any).session?.csrfToken;

    if (!csrfToken || csrfToken !== sessionToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

