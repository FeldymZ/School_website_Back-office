import axios from "axios"
import api from "@/services/api"
import type { MenuModule, MenuModulePayload } from "@/types/menuModule"

/* =============================
   BASE URL
============================= */
const PUBLIC = "/api/menu-modules"
const ADMIN = "/api/admin/menu-modules"

/* Message d'erreur lisible (renvoyé par le serveur si possible) */
const erreur = (err: unknown, defaut: string): Error => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | string | undefined
    if (typeof data === "string" && data.trim()) return new Error(data)
    if (data && typeof data === "object") return new Error(data.message || data.error || defaut)
  }
  return new Error(defaut)
}

const appel = async <T>(fn: () => Promise<{ data: T }>, defaut: string): Promise<T> => {
  try {
    return (await fn()).data
  } catch (err) {
    throw erreur(err, defaut)
  }
}

export const MenuModuleService = {
  /** Modules visibles dans le menu (tous les utilisateurs connectés) */
  actifs: () => appel(() => api.get<MenuModule[]>(PUBLIC), "Impossible de charger le menu"),

  /** Tous les modules, y compris masqués (SUPERADMIN) */
  tous: () => appel(() => api.get<MenuModule[]>(ADMIN), "Impossible de charger les modules"),

  creer: (payload: MenuModulePayload) =>
    appel(() => api.post<MenuModule>(ADMIN, payload), "Impossible de créer le module"),

  modifier: (id: number, payload: MenuModulePayload) =>
    appel(() => api.put<MenuModule>(`${ADMIN}/${id}`, payload), "Impossible de modifier le module"),

  changerActif: (id: number, valeur: boolean) =>
    appel(() => api.patch<MenuModule>(`${ADMIN}/${id}/actif`, null, { params: { valeur } }), "Action impossible"),

  /** Ids d'une section dans le nouvel ordre */
  reordonner: (ids: number[]) =>
    appel(() => api.put<void>(`${ADMIN}/ordre`, { ids }), "Impossible de changer l'ordre"),

  supprimer: (id: number) =>
    appel(() => api.delete<void>(`${ADMIN}/${id}`), "Impossible de supprimer le module"),

  /** Toutes les clés acceptées par le serveur (clés d'origine + clés des modules) */
  cles: () => appel(() => api.get<string[]>("/api/menu-permissions"), "Impossible de charger les clés"),
}

export default MenuModuleService