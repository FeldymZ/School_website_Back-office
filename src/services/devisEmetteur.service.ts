import api from "./api"
import { call } from "./DemandeDevisContinuesService"
import type { DevisEmetteur } from "@/types/devis"

/* =============================
   BASE URL
============================= */
const API = "/api/admin/devis/emetteurs"

export interface EmetteurPayload {
  nom: string
  fonction: string
  signature?: File | null
  cachet?: File | null
  supprimerCachet?: boolean
}

const toFormData = (p: EmetteurPayload) => {
  const fd = new FormData()
  fd.append("nom", p.nom.trim())
  fd.append("fonction", p.fonction.trim())
  if (p.signature) fd.append("signature", p.signature)
  if (p.cachet) fd.append("cachet", p.cachet)
  if (p.supprimerCachet) fd.append("supprimerCachet", "true")
  return fd
}

/* =============================
   VALIDATEURS DES DEVIS
============================= */
export const DevisEmetteurService = {

  /* LISTE */
  async list(): Promise<DevisEmetteur[]> {
    return call(() => api.get(API), "Impossible de charger les validateurs")
  },

  /* VALIDATEUR PAR DÉFAUT (null si aucun) */
  async actif(): Promise<DevisEmetteur | null> {
    const data = await call<DevisEmetteur | "" | null>(() => api.get(`${API}/actif`), "Erreur")
    return data || null
  },

  /* CRÉER */
  async create(p: EmetteurPayload): Promise<void> {
    await call(() => api.post(API, toFormData(p)), "Erreur lors de la création")
  },

  /* MODIFIER */
  async update(id: number, p: EmetteurPayload): Promise<void> {
    await call(() => api.put(`${API}/${id}`, toFormData(p)), "Erreur lors de la modification")
  },

  /* SUPPRIMER */
  async remove(id: number): Promise<void> {
    await call(() => api.delete(`${API}/${id}`), "Erreur lors de la suppression")
  },

  /* DÉFINIR PAR DÉFAUT (SUPERADMIN) */
  async activer(id: number): Promise<void> {
    await call(() => api.put(`${API}/${id}/activer`), "Action réservée au SUPERADMIN")
  },
}

export default DevisEmetteurService