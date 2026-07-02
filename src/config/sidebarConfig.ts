import {
  LayoutDashboard, GraduationCap, BookOpen, ClipboardList,
  Mail, Newspaper, Settings, LucideIcon,
} from "lucide-react"

export interface SidebarChild {
  label: string
  path: string
  badgeKey?: "unreplied" | "devis" | "preinscription"
  permissionKey?: string
}

export interface SidebarItem {
  icon: LucideIcon
  label: string
  path?: string
  section: string
  permissionKey?: string
  children?: SidebarChild[]
  defaultOpen?: boolean
}

export const SIDEBAR_CONFIG: SidebarItem[] = [
  {
    icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", section: "Général",
  },
  {
    icon: GraduationCap, label: "Formations initiales", path: "/formations",
    section: "Formations", permissionKey: "FORMATIONS_FORMATIONS_INITIALES",
  },
  {
    icon: BookOpen, label: "Formations continues", section: "Formations", defaultOpen: true,
    children: [
      { label: "Catégories", path: "/categories", permissionKey: "FORMATIONS_CONTINUES_CATEGORIES" },
      { label: "Sous-catégories", path: "/sous-categories", permissionKey: "FORMATIONS_CONTINUES_SOUS_CATEGORIES" },
      { label: "Formations", path: "/formations-continues", permissionKey: "FORMATIONS_CONTINUES_FORMATIONS" },
      { label: "Devis", path: "/demandes-devis", badgeKey: "devis", permissionKey: "FORMATIONS_CONTINUES_DEVIS" },
    ],
  },
  {
    icon: ClipboardList, label: "Préinscriptions", section: "Préinscriptions",
    children: [
      { label: "Demandes", path: "/preinscriptions", badgeKey: "preinscription", permissionKey: "PREINSCRIPTIONS_DEMANDES" },
      { label: "Paramètres", path: "/preinscriptions/configuration", permissionKey: "PREINSCRIPTIONS_PARAMETRES" },
    ],
  },
  {
    icon: Mail, label: "Communication", section: "Communication",
    children: [
      { label: "Actualités", path: "/actualites", permissionKey: "COMMUNICATION_ACTUALITES" },
      { label: "Pop-up", path: "/banner-messages", permissionKey: "COMMUNICATION_BANNER_MESSAGES" },
      { label: "Messages", path: "/messages", badgeKey: "unreplied", permissionKey: "COMMUNICATION_MESSAGES" },
      { label: "Agenda", path: "/agenda", permissionKey: "COMMUNICATION_AGENDA" },
    ],
  },
  {
    icon: Newspaper, label: "Éditorial", section: "Éditorial",
    children: [
      { label: "Activités", path: "/activites", permissionKey: "EDITORIAL_ACTIVITES" },
      { label: "Bannières", path: "/banners", permissionKey: "EDITORIAL_BANNERS" },
      { label: "Commentaires", path: "/commentaires", permissionKey: "EDITORIAL_COMMENTAIRES" },
      { label: "Statistiques", path: "/statistiques", permissionKey: "EDITORIAL_STATISTIQUES" },
      { label: "Partenaires", path: "/partenaires", permissionKey: "EDITORIAL_PARTENAIRES" },
    ],
  },
  {
    icon: Settings, label: "Système", section: "Administration",
    children: [
      { label: "Utilisateurs", path: "/utilisateurs", permissionKey: "ADMINISTRATION_UTILISATEURS" },
      { label: "Audits", path: "/configuration", permissionKey: "ADMINISTRATION_AUDITS" },
    ],
  },
]