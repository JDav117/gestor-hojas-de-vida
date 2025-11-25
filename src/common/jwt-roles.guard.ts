import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class JwtRolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero: Ejecutar autenticación JWT
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Segundo: Verificar roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      throw new ForbiddenException('El usuario no tiene roles asignados');
    }

    const userRoles = user.roles.map((role: string | { nombre_rol: string }) => {
      const roleName = typeof role === 'string' ? role : role.nombre_rol;
      return roleName.trim().toLowerCase();
    });

    const normalizedRequiredRoles = requiredRoles.map((role: string) => 
      role.trim().toLowerCase()
    );

    const hasRole = normalizedRequiredRoles.some((requiredRole: string) => 
      userRoles.includes(requiredRole)
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
