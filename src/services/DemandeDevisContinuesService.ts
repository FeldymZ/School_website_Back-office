import axios from "axios"
import api from "./api"

import type {
  DemandeDevisAdmin,
  DemandeDevisReponse,
  DemandesDevisStats,
  Devis,
  GenererDevisRequest,
  PageResult,
  StatutDemandeDevis,
} from "@/types/devis"

/* =============================
   BASE URL
============================= */
const API = "/api/admin/demandes-devis"

/* =============================
   GESTION DES ERREURS
   Transforme une erreur axios en Error contenant le message renvoyé par l'API
   (sinon axios affiche seulement "Request failed with status code 400")
============================= */
export async function toApiError(err: unknown, fallback: string): Promise<Error> {
  if (axios.isAxiosError(err)) {
    let data: unknown = err.response?.data

    // Réponse attendue en blob (PDF) : le message d'erreur JSON est dans le blob
    if (data instanceof Blob) {
      try {
        data = JSON.parse(await data.text())
      } catch {
        data = undefined
      }
    }

    const d = data as { message?: string; error?: string } | undefined
    return new Error(d?.message ?? d?.error ?? fallback)
  }
  return err instanceof Error ? err : new Error(fallback)
}

export async function call<T>(fn: () => Promise<{ data: T }>, fallback: string): Promise<T> {
  try {
    const res = await fn()
    return res.data
  } catch (err) {
    throw await toApiError(err, fallback)
  }
}

/* =============================
   PAGINATION
   Spring renvoie la page à plat ou sous "page" selon la version : on normalise
============================= */
type RawPage<T> = {
  content?: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
  page?: { totalElements?: number; totalPages?: number; number?: number; size?: number }
}

const normalizePage = <T>(raw: RawPage<T> | undefined): PageResult<T> => ({
  content: raw?.content ?? [],
  totalElements: raw?.totalElements ?? raw?.page?.totalElements ?? 0,
  totalPages: raw?.totalPages ?? raw?.page?.totalPages ?? 0,
  number: raw?.number ?? raw?.page?.number ?? 0,
  size: raw?.size ?? raw?.page?.size ?? 0,
})

const DemandeDevisContinuesService = {

  /* =============================
     LISTE PAGINÉE (+ filtre statut)
  ============================= */
  async getAll(
    page = 0,
    size = 10,
    statut?: StatutDemandeDevis
  ): Promise<PageResult<DemandeDevisAdmin>> {

    const raw = await call<RawPage<DemandeDevisAdmin>>(
      () => api.get(API, { params: { page, size, ...(statut ? { statut } : {}) } }),
      "Impossible de charger les demandes"
    )
    return normalizePage(raw)
  },

  /** Alias utilisé par la page d'administration */
  list(page: number, size: number, statut?: StatutDemandeDevis) {
    return DemandeDevisContinuesService.getAll(page, size, statut)
  },

  /* =============================
     STATISTIQUES
  ============================= */
  async stats(): Promise<DemandesDevisStats> {
    return call(() => api.get(`${API}/stats`), "Impossible de charger les statistiques")
  },

  /* =============================
     DÉTAIL
  ============================= */
  async getById(id: number): Promise<DemandeDevisAdmin> {
    return call(() => api.get(`${API}/${id}`), "Demande introuvable")
  },

  /* =============================
     RÉPONDRE
     - repondre(id, formData)            ← ancienne utilisation
     - repondre(id, message, fichier?)   ← nouvelle utilisation
  ============================= */
  async repondre(id: number, contenu: FormData | string, pieceJointe?: File | null): Promise<void> {

    let formData: FormData
    if (contenu instanceof FormData) {
      formData = contenu
    } else {
      formData = new FormData()
      formData.append("message", contenu)
      if (pieceJointe) formData.append("pieceJointe", pieceJointe)
    }

    await call(() => api.post(`${API}/${id}/repondre`, formData), "Erreur lors de l'envoi de la réponse")
  },

  /* =============================
     CLÔTURER DEMANDE 🔥
  ============================= */
  async cloturer(id: number): Promise<void> {
    await call(() => api.post(`${API}/${id}/cloturer`), "Erreur lors de la clôture")
  },

  /* =============================
     SUPPRIMER DEMANDE
  ============================= */
  async supprimer(id: number): Promise<void> {
    await call(() => api.delete(`${API}/${id}`), "Erreur lors de la suppression")
  },

  /* =============================
     COMPTER NON TRAITÉES
  ============================= */
  async countNonTraitees(): Promise<number> {
    try {
      const res = await api.get(`${API}/count-non-traitees`)
      return res.data
    } catch {
      return 0
    }
  },

  /* =============================
     LISTE RÉPONSES
  ============================= */
  async getReponses(id: number): Promise<DemandeDevisReponse[]> {
    return call(() => api.get(`${API}/${id}/reponses`), "Impossible de charger les réponses")
  },

  /* =============================
     DEVIS : VALIDER (générer / régénérer)
  ============================= */
  async genererDevis(id: number, payload: GenererDevisRequest): Promise<Devis> {
    return call(() => api.post(`${API}/${id}/devis`, payload), "Erreur lors de la validation du devis")
  },

  /* =============================
     DEVIS : CONSULTER (null si aucun devis)
  ============================= */
  async getDevis(id: number): Promise<Devis | null> {
    try {
      const res = await api.get(`${API}/${id}/devis`)
      return res.data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null
      throw await toApiError(err, "Impossible de charger le devis")
    }
  },

  /* =============================
     DEVIS : TÉLÉCHARGER LE PDF
  ============================= */
  async telechargerDevis(id: number): Promise<Blob> {
    return call(
      () => api.get(`${API}/${id}/devis/pdf`, { responseType: "blob" }),
      "Impossible de télécharger le devis"
    )
  },

  /* =============================
     DEVIS : ENVOYER AU CLIENT (PDF en pièce jointe)
  ============================= */
  async envoyerDevis(id: number, message: string): Promise<void> {
    await call(() => api.post(`${API}/${id}/devis/envoyer`, { message }), "Erreur lors de l'envoi du devis")
  },
}

/* =============================
   TÉLÉCHARGEMENT D'UN FICHIER DANS LE NAVIGATEUR
============================= */
export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* Nom utilisé par les composants du module devis */
export { DemandeDevisContinuesService as DemandeDevisService }

export default DemandeDevisContinuesService