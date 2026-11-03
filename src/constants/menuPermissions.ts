/* =========================================================
   ACCÈS AUX MENUS (cases à cocher de « Gérer les menus »)

   ✅ Construits AUTOMATIQUEMENT à partir des modules gérés dans
      Administration → Modules (table menu_modules du serveur).
      Ajoutez / renommez / masquez un module là-bas : les cases
      se mettent à jour toutes seules.

   Tant que les modules ne sont pas chargés, la liste vient du
   menu par défaut (src/config/sidebarConfig.ts).

   Les liens qui partagent la même clé (ex. « Devis » et
   « Validateurs des devis ») forment UNE seule case.
========================================================= */
import {
  permissionsDepuisModules,
  permissionsParDefaut,
  type MenuPermissionGroup,
  type MenuPermissionItem,
} from "@/config/menuDynamique"
import { abonnerModules, getModules } from "@/stores/menuModulesStore"

export type { MenuPermissionGroup, MenuPermissionItem }

/**
 * Groupes de cases à cocher (utilisé par MenuAccessSelector,
 * MenuAccessDropdownSelector, menuAccessLabels…).
 * Le tableau est mis à jour SUR PLACE quand les modules arrivent du serveur.
 */
export const MENU_PERMISSION_GROUPS: MenuPermissionGroup[] = permissionsParDefaut()

/** Toutes les clés, dans l'ordre du menu */
export const ALL_MENU_PERMISSION_KEYS: string[] = []

/** Clé → libellé (ex. pour afficher les accès d'un utilisateur) */
export const MENU_PERMISSION_LABELS: Record<string, string> = {}

const synchroniser = () => {
  const modules = getModules()
  const groupes = modules ? permissionsDepuisModules(modules) : permissionsParDefaut()

  MENU_PERMISSION_GROUPS.splice(0, MENU_PERMISSION_GROUPS.length, ...groupes)

  const items = groupes.flatMap((g) => g.items)
  ALL_MENU_PERMISSION_KEYS.splice(0, ALL_MENU_PERMISSION_KEYS.length, ...items.map((i) => i.key))
  Object.keys(MENU_PERMISSION_LABELS).forEach((k) => delete MENU_PERMISSION_LABELS[k])
  items.forEach((i) => (MENU_PERMISSION_LABELS[i.key] = i.label))
}

synchroniser()
abonnerModules(synchroniser)