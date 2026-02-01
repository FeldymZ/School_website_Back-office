import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";
import { hasRequiredRole } from "@/utils/role";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) => {
  const user = getUserFromToken();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!hasRequiredRole(user.role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
