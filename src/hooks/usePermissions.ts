import { useAuthStore } from '../store/auth.store';
import type { UserRole } from '../types/user.types';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = hasRole('superadmin', 'admin_sucursal');
  const isStaff = hasRole('superadmin', 'admin_sucursal', 'recepcionista');
  const isProfessional = hasRole('profesional');
  const isPatient = hasRole('paciente');

  return { hasRole, isAdmin, isStaff, isProfessional, isPatient };
}
