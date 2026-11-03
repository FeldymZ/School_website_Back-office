/* =========================================================
   Modules du menu, chargés une fois depuis le serveur et
   partagés par : la barre de gauche, les cases d'accès
   (« Gérer les menus ») et la protection des pages.

   - chargerModules()        → (re)charge depuis le serveur
   - useMenuModules()        → hook React (null tant que pas chargé)
   - abonnerModules(fn)      → pour le code hors React
========================================================= */
import { useSyncExternalStore } from "react"
import { MenuModuleService } from "@/services/menuModule.service"
import type { MenuModule } from "@/types/menuModule"

let modules: MenuModule[] | null = null
let enCours: Promise<void> | null = null
const abonnes = new Set<() => void>()

const prevenir = () => abonnes.forEach((fn) => fn())

export const abonnerModules = (fn: () => void) => {
  abonnes.add(fn)
  return () => {
    abonnes.delete(fn)
  }
}

export const getModules = () => modules

/** force = true : recharge même si déjà chargé (après une modification) */
export const chargerModules = (force = false): Promise<void> => {
  if (enCours) return enCours
  if (modules && !force) return Promise.resolve()

  enCours = MenuModuleService.actifs()
    .then((liste) => {
      modules = liste
      prevenir()
    })
    .catch((err) => {
      /* Pas bloquant : le menu par défaut (sidebarConfig.ts) reste affiché */
      console.error("Menu dynamique indisponible, menu par défaut utilisé", err)
    })
    .finally(() => {
      enCours = null
    })

  return enCours
}

/** Hook : liste des modules actifs (null = pas encore chargés) */
export const useMenuModules = () => useSyncExternalStore(abonnerModules, getModules, getModules)