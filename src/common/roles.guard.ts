import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

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