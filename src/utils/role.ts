import { UserRole } from "@/types/user";

/**
 * Hiérarchie des rôles
 * valeur élevée = plus de privilèges
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {

  [UserRole.ADMIN]: 1,
  [UserRole.SUPERADMIN]: 2,
};

/**
 * Vérifie si un rôle utilisateur satisfait
 * au moins un des rôles autorisés
 */
export const hasRequiredRole = (
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole];

  return allowedRoles.some(
    (allowedRole) => userLevel >= ROLE_HIERARCHY[allowedRole]
  );
};