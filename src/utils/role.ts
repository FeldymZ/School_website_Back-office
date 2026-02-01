import { UserRole } from "@/types/user";

/**
 * Ordre de puissance des rôles
 * index élevé = plus de privilèges
 */
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPERADMIN,
];

/**
 * Vérifie si un rôle utilisateur satisfait
 * au moins un des rôles autorisés
 */
export const hasRequiredRole = (
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);

  return allowedRoles.some(
    (allowedRole) =>
      userLevel >= ROLE_HIERARCHY.indexOf(allowedRole)
  );
};
