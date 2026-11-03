import api from "./api"
import { call } from "./DemandeDevisContinuesService"
import type { PageResult } from "@/types/devis"
import type {
  FormationOption,
  InscriptionSession,
  InscriptionsStats,
  PageSessionsFormation,
  PageSessionsFormationPayload,
  SessionFormation,
  SessionFormationPayload,
  StatutInscription,
} from "@/types/sessionFormation"

/* =============================
   BASE URL
============================= */
const API_SESSIONS = "/api/admin/sessions-formation"
const API_INSCRIPTIONS = "/api/admin/inscriptions-formation"
const API_PAGE = "/api/admin/sessions-formation-page"

/* Spring renvoie la page à plat ou sous "page" selon la version : on normalise */
type RawPage<T> = {
  content?: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
  page?: { totalElements?: number; totalPages?: number; number?: number; size?: number }
}
const normaliserPage = <T,>(r: RawPage<T>): PageResult<T> => ({
  content: r.content ?? [],
  totalElements: r.page?.totalElements ?? r.totalElements ?? 0,
  totalPages: r.page?.totalPages ?? r.totalPages ?? 0,
  number: r.page?.number ?? r.number ?? 0,
  size: r.page?.size ?? r.size ?? 0,
})

/* =============================
   AGENDA DE FORMATION
============================= */
export const SessionFormationService = {

  async list(): Promise<SessionFormation[]> {
    return call(() => api.get(API_SESSIONS), "Impossible de charger l'agenda")
  },

  async formations(): Promise<FormationOption[]> {
    return call(() => api.get(`${API_SESSIONS}/formations`), "Impossible de charger les formations")
  },

  async create(p: SessionFormationPayload): Promise<SessionFormation> {
    return call(() => api.post(API_SESSIONS, p), "Erreur lors de la création de la session")
  },

  async update(id: number, p: SessionFormationPayload): Promise<SessionFormation> {
    return call(() => api.put(`${API_SESSIONS}/${id}`, p), "Erreur lors de la modification de la session")
  },

  async setActive(id: number, valeur: boolean): Promise<SessionFormation> {
    return call(() => api.patch(`${API_SESSIONS}/${id}/active`, null, { params: { valeur } }), "Action impossible")
  },

  async remove(id: number): Promise<void> {
    await call(() => api.delete(`${API_SESSIONS}/${id}`), "Suppression impossible")
  },
}

/* =============================
   DEMANDES DE PARTICIPATION
============================= */
export const InscriptionSessionService = {

  async list(page: number, size: number, statut?: StatutInscription, sessionId?: number): Promise<PageResult<InscriptionSession>> {
    const raw = await call<RawPage<InscriptionSession>>(
      () => api.get(API_INSCRIPTIONS, { params: { page, size, statut, sessionId } }),
      "Impossible de charger les demandes"
    )
    return normaliserPage(raw)
  },

  async stats(): Promise<InscriptionsStats> {
    return call(() => api.get(`${API_INSCRIPTIONS}/stats`), "Impossible de charger les statistiques")
  },

  async sessions(): Promise<SessionFormation[]> {
    return call(() => api.get(`${API_INSCRIPTIONS}/sessions`), "Impossible de charger les sessions")
  },

  async parSession(sessionId: number): Promise<InscriptionSession[]> {
    return call(() => api.get(`${API_INSCRIPTIONS}/session/${sessionId}`), "Impossible de charger les inscrits")
  },

  async confirmer(id: number): Promise<InscriptionSession> {
    return call(() => api.patch(`${API_INSCRIPTIONS}/${id}/confirmer`), "Confirmation impossible")
  },

  async refuser(id: number, motif: string): Promise<InscriptionSession> {
    return call(() => api.patch(`${API_INSCRIPTIONS}/${id}/refuser`, { motif }), "Refus impossible")
  },

  async remove(id: number): Promise<void> {
    await call(() => api.delete(`${API_INSCRIPTIONS}/${id}`), "Suppression impossible")
  },
}

/* =============================
   PAGE PUBLIQUE (image + textes de l'en-tête)
============================= */
export const PageSessionsFormationService = {

  async lire(): Promise<PageSessionsFormation> {
    return call(() => api.get(API_PAGE), "Impossible de charger la page")
  },

  async modifier(p: PageSessionsFormationPayload): Promise<PageSessionsFormation> {
    const fd = new FormData()
    fd.append("badge", p.badge.trim())
    fd.append("titre", p.titre.trim())
    fd.append("sousTitre", p.sousTitre.trim())
    if (p.image) fd.append("image", p.image)
    if (p.supprimerImage) fd.append("supprimerImage", "true")
    return call(() => api.put(API_PAGE, fd), "Erreur lors de l'enregistrement de la page")
  },
}