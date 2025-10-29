import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
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
      return true; // No roles required
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      throw new ForbiddenException('No roles found');
    }
    const userRoles = Array.isArray(user.roles)
      ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol || r.name || r)
      : [];
    // Comparación case-insensitive para evitar fallos por mayúsculas/minúsculas
    const userRolesLc = userRoles.map((v: any) => String(v).toLowerCase());
    const requiredLc = requiredRoles.map(r => String(r).toLowerCase());
    const hasRole = requiredLc.some(role => userRolesLc.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('You do not have the required role');
    }
    return true;
  }
}
