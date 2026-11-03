/* =========================================================
   Transforme les modules (table menu_modules) en :
   - menu de la barre de gauche (SidebarItem[])
   - groupes de cases d'accès (« Gérer les menus »)
========================================================= */
import {
  GraduationCap, BookOpen, ClipboardList, Mail, Newspaper, Settings, Folder, FileText, Users,
  CalendarDays, BarChart3, Briefcase, Globe, Image, MessageSquare, Award, Layers, Star, LayoutGrid, Link2,
  type LucideIcon,
} from "lucide-react"
import { SIDEBAR_CONFIG, type SidebarChild, type SidebarItem } from "@/config/sidebarConfig"
import type { MenuModule } from "@/types/menuModule"

/* ---------- Icônes disponibles (mêmes noms que MenuModuleService.ICONES côté serveur) ---------- */
export const ICONES: Record<string, { icon: LucideIcon; label: string }> = {
  "graduation-cap": { icon: GraduationCap, label: "Diplôme" },
  "book-open": { icon: BookOpen, label: "Livre" },
  "clipboard-list": { icon: ClipboardList, label: "Liste" },
  mail: { icon: Mail, label: "Courrier" },
  newspaper: { icon: Newspaper, label: "Journal" },
  settings: { icon: Settings, label: "Réglages" },
  folder: { icon: Folder, label: "Dossier" },
  "file-text": { icon: FileText, label: "Document" },
  users: { icon: Users, label: "Personnes" },
  calendar: { icon: CalendarDays, label: "Calendrier" },
  "bar-chart": { icon: BarChart3, label: "Graphique" },
  briefcase: { icon: Briefcase, label: "Mallette" },
  globe: { icon: Globe, label: "Web" },
  image: { icon: Image, label: "Image" },
  "message-square": { icon: MessageSquare, label: "Message" },
  award: { icon: Award, label: "Récompense" },
  layers: { icon: Layers, label: "Couches" },
  star: { icon: Star, label: "Étoile" },
  "layout-grid": { icon: LayoutGrid, label: "Grille" },
  link: { icon: Link2, label: "Lien" },
}

export const iconeDe = (nom?: string | null): LucideIcon => (nom && ICONES[nom]?.icon) || Folder

/* Pastilles rouges (compteurs) : reprises du menu par défaut, selon le lien */
const BADGES = new Map<string, NonNullable<SidebarChild["badgeKey"]>>([
  ...SIDEBAR_CONFIG.filter((i) => i.path && i.badgeKey).map((i) => [i.path!, i.badgeKey!] as const),
  ...SIDEBAR_CONFIG.flatMap((i) => i.children ?? []).filter((c) => c.badgeKey).map((c) => [c.path, c.badgeKey!] as const),
])

/* Sous-menus ouverts par défaut */
const OUVERTS = new Set(SIDEBAR_CONFIG.filter((i) => i.defaultOpen).map((i) => i.label))

/* Le tableau de bord n'est pas un module : toujours affiché en premier */
const FIXES = SIDEBAR_CONFIG.filter((i) => i.path === "/dashboard")

/** Modules → menu de la barre de gauche */
export const construireMenu = (modules: MenuModule[]): SidebarItem[] => {
  const items: SidebarItem[] = [...FIXES]
  const groupes = new Map<string, SidebarItem>()

  ;[...modules]
    .filter((m) => m.actif)
    .sort((a, b) => a.ordre - b.ordre || a.id - b.id)
    .forEach((m) => {
      const permissionKey = m.cle ?? undefined

      /* Lien direct (sans sous-menu) */
      if (!m.groupe) {
        items.push({
          icon: iconeDe(m.icone),
          label: m.libelle,
          path: m.chemin,
          section: m.section,
          permissionKey,
          superAdminOnly: m.superAdminSeulement,
          badgeKey: BADGES.get(m.chemin),
        })
        return
      }

      /* Lien dans un sous-menu (créé au premier module rencontré) */
      const id = `${m.section}||${m.groupe}`
      let groupe = groupes.get(id)
      if (!groupe) {
        groupe = {
          icon: iconeDe(m.icone),
          label: m.groupe,
          section: m.section,
          children: [],
          defaultOpen: OUVERTS.has(m.groupe),
        }
        groupes.set(id, groupe)
        items.push(groupe)
      }
      groupe.children!.push({
        label: m.libelle,
        path: m.chemin,
        permissionKey,
        badgeKey: BADGES.get(m.chemin),
        superAdminOnly: m.superAdminSeulement,
      })
    })

  return items
}

/* ---------- Cases d'accès ---------- */

export interface MenuPermissionItem {
  key: string
  label: string
}

export interface MenuPermissionGroup {
  section: string
  items: MenuPermissionItem[]
}

type Entree = { section: string; cle?: string | null; libelle: string; superAdmin?: boolean }

/** Regroupe les liens par sous-menu ; les liens qui partagent une clé forment UNE case */
const grouper = (entrees: Entree[]): MenuPermissionGroup[] => {
  const groupes: MenuPermissionGroup[] = []
  const parCle = new Map<string, MenuPermissionItem>()

  entrees.forEach(({ section, cle, libelle, superAdmin }) => {
    if (!cle || superAdmin) return

    const existant = parCle.get(cle)
    if (existant) {
      if (!existant.label.split(" · ").includes(libelle)) existant.label = `${existant.label} · ${libelle}`
      return
    }

    const item = { key: cle, label: libelle }
    parCle.set(cle, item)

    let groupe = groupes.find((g) => g.section === section)
    if (!groupe) {
      groupe = { section, items: [] }
      groupes.push(groupe)
    }
    groupe.items.push(item)
  })

  return groupes
}

/** Cases d'accès à partir des modules du serveur */
export const permissionsDepuisModules = (modules: MenuModule[]): MenuPermissionGroup[] =>
  grouper(
    [...modules]
      .filter((m) => m.actif)
      .sort((a, b) => a.ordre - b.ordre || a.id - b.id)
      .map((m) => ({ section: m.groupe ?? m.section, cle: m.cle, libelle: m.libelle, superAdmin: m.superAdminSeulement }))
  )

/** Cases d'accès à partir du menu par défaut (avant chargement / serveur indisponible) */
export const permissionsParDefaut = (): MenuPermissionGroup[] =>
  grouper(
    SIDEBAR_CONFIG.flatMap((item) =>
      item.children
        ? item.children.map((c) => ({ section: item.label, cle: c.permissionKey, libelle: c.label, superAdmin: c.superAdminOnly }))
        : [{ section: item.section, cle: item.permissionKey, libelle: item.label, superAdmin: item.superAdminOnly }]
    )
  )