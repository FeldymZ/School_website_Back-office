import { MENU_PERMISSION_GROUPS } from "@/constants/menuPermissions"

export interface SectionStatus {
  section: string
  items: { key: string; label: string; granted: boolean }[]
  grantedCount: number
  total: number
}

export const getSectionsStatus = (menuAccess: string[]): SectionStatus[] => {
  return MENU_PERMISSION_GROUPS.map((group) => {
    const items = group.items.map((item) => ({
      key: item.key,
      label: item.label,
      granted: menuAccess.includes(item.key),
    }))
    return {
      section: group.section,
      items,
      grantedCount: items.filter((i) => i.granted).length,
      total: items.length,
    }
  })
}

export const getTotalCoverage = (menuAccess: string[]) => {
  const total = MENU_PERMISSION_GROUPS.reduce((acc, g) => acc + g.items.length, 0)
  const granted = menuAccess.length
  return { granted, total }
}