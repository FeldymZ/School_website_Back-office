import { Navigate } from "react-router-dom"
import { ReactNode } from "react"
import { useUser } from "@/context/UserContext"
import { UserRole } from "@/types/user"
import { hasRequiredRole } from "@/utils/role"

interface Props {
  permissionKey?: string // undefined = route non configurable, accessible à tout ADMIN authentifié
  children: ReactNode
}

const MenuAccessProtectedRoute = ({ permissionKey, children }: Props) => {
  const { user, loading } = useUser()

  if (loading) return null // évite un flash de redirection pendant le chargement de /api/me

  if (!user) return <Navigate to="/login" replace />

  const isSuperAdmin = hasRequiredRole(user.role, [UserRole.SUPERADMIN])
  if (isSuperAdmin) return <>{children}</> // accès total, toujours

  // Route non configurable (pas de permissionKey défini dans sidebarConfig) -> accessible à tout ADMIN
  if (!permissionKey) return <>{children}</>

  const hasAccess = user.menuAccess?.includes(permissionKey) ?? false
  if (!hasAccess) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export default MenuAccessProtectedRoute