import { Navigate, useLocation } from "react-router-dom"
import { ReactNode } from "react"
import { useUser } from "@/context/useUser"
import { UserRole } from "@/types/user"
import { hasRequiredRole } from "@/utils/role"
import { useMenuModules } from "@/stores/menuModulesStore"

interface Props {
  permissionKey?: string // undefined = route non configurable, accessible à tout ADMIN authentifié
  superAdminOnly?: boolean // 🆕 true = page réservée aux SUPERADMIN (ex. « Modules »)
  children: ReactNode
}

const MenuAccessProtectedRoute = ({ permissionKey, superAdminOnly, children }: Props) => {
  const { user, loading } = useUser()
  const { pathname } = useLocation()
  const modules = useMenuModules()

  if (loading) return null // évite un flash de redirection pendant le chargement de /api/me

  if (!user) return <Navigate to="/login" replace />

  const isSuperAdmin = hasRequiredRole(user.role, [UserRole.SUPERADMIN])
  if (isSuperAdmin) return <>{children}</> // accès total, toujours

  // 🆕 Page réservée au SUPERADMIN
  if (superAdminOnly) return <Navigate to="/dashboard" replace />

  // Route non configurable (pas de permissionKey) -> accessible à tout ADMIN
  if (!permissionKey) return <>{children}</>

  // 🆕 Clé de la route + clés des modules (créés dans « Modules ») qui pointent vers cette page
  const clesAcceptees = new Set<string>([permissionKey])
  modules?.forEach((m) => {
    if (m.chemin === pathname && m.cle && !m.superAdminSeulement) clesAcceptees.add(m.cle)
  })

  const hasAccess = user.menuAccess?.some((k) => clesAcceptees.has(k)) ?? false
  if (!hasAccess) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export default MenuAccessProtectedRoute