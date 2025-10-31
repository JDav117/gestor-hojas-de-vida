import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor para logging automático de requests
 * Registra método HTTP, URL, tiempo de respuesta y código de estado
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.userId || 'anonymous';
    
    const now = Date.now();
    
    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const contentLength = response.get('content-length') || 0;
          const responseTime = Date.now() - now;
          
          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms ${contentLength}bytes - ${userAgent} - User: ${userId}`
          );
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = error.status || 500;
          const responseTime = Date.now() - now;
          
          this.logger.error(
            `${method} ${url} ${statusCode} ${responseTime}ms - ${userAgent} - User: ${userId} - Error: ${error.message}`
          );
        },
      })
    );
  }
}

/**
 * Interceptor para logging de operaciones de base de datos
 */
@Injectable()
export class DatabaseLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Database');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          if (duration > 1000) {
            // Log queries lentas (> 1 segundo)
            this.logger.warn(
              `Slow query detected: ${className}.${methodName} took ${duration}ms`
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `Database error in ${className}.${methodName} after ${duration}ms: ${error.message}`
          );
        },
      })
    );
  }
}
