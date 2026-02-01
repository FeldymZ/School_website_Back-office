import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getUserFromToken } from "@/utils/auth";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const user = getUserFromToken();

  // ⛔ Pas d'utilisateur → login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
