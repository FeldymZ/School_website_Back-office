import { SIDEBAR_CONFIG } from "@/config/sidebarConfig"

export const ROUTE_PERMISSIONS: Record<string, string | undefined> = SIDEBAR_CONFIG.reduce<Record<string, string | undefined>>(
  (map, item) => {
    if (item.path) map[item.path] = item.permissionKey
    item.children?.forEach((child) => {
      map[child.path] = child.permissionKey
    })
    return map
  },
  {}
)

// Retourne la clé de permission requise pour un chemin donné, ou undefined si non configurable (ex: Dashboard)
export const getPermissionKeyForPath = (path: string): string | undefined => ROUTE_PERMISSIONS[path]