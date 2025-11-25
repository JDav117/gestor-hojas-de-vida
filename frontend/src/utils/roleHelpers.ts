import { User } from '../types/entities';

/**
 * Extrae los nombres de roles de un usuario en minúsculas
 */
export function getRoleNames(user: User | null | undefined): string[] {
  if (!user?.roles) return [];
  return user.roles
    .map((r: any) => {
      // Manejar diferentes formatos: objeto con nombre_rol, o string directo
      if (typeof r === 'string') return r.toLowerCase();
      if (r && typeof r === 'object' && 'nombre_rol' in r) {
        return String(r.nombre_rol || '').toLowerCase();
      }
      return '';
    })
    .filter(Boolean);
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(user: User | null | undefined, roleName: string): boolean {
  const roleNames = getRoleNames(user);
  return roleNames.includes(roleName.toLowerCase());
}

/**
 * Obtiene el rol efectivo del usuario según prioridad
 * Prioridad: admin > evaluador > postulante > none
 */
export function getEffectiveRole(user: User | null | undefined): 'admin' | 'evaluador' | 'postulante' | 'none' {
  const roleNames = getRoleNames(user);
  
  if (roleNames.includes('admin')) return 'admin';
  if (roleNames.includes('evaluador')) return 'evaluador';
  if (roleNames.includes('postulante')) return 'postulante';
  
  return 'none';
}

/**
 * Obtiene la ruta por defecto según el rol del usuario
 */
export function getDefaultRouteForRole(user: User | null | undefined): string {
  // Todos los usuarios van a perfil después del login
  // Desde ahí pueden navegar según sus permisos
  return '/perfil';
}
