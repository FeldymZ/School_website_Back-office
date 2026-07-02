import { SIDEBAR_CONFIG } from "@/config/sidebarConfig"

export interface MenuPermissionOption {
  key: string
  label: string
}

export interface MenuPermissionGroup {
  section: string
  items: MenuPermissionOption[]
}

export const MENU_PERMISSION_GROUPS: MenuPermissionGroup[] = SIDEBAR_CONFIG.reduce<MenuPermissionGroup[]>(
  (groups, item) => {
    const options: MenuPermissionOption[] = []

    if (item.children?.length) {
      item.children.forEach((child) => {
        if (child.permissionKey) options.push({ key: child.permissionKey, label: child.label })
      })
    } else if (item.permissionKey) {
      options.push({ key: item.permissionKey, label: item.label })
    }

    if (options.length === 0) return groups

    const existing = groups.find((g) => g.section === item.section)
    if (existing) existing.items.push(...options)
    else groups.push({ section: item.section, items: options })

    return groups
  },
  []
)