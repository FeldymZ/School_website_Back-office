import api from "./api"

import { DemandeDevisContinue } from "@/types/demande-devis-continue"
import { PageResponse } from "@/types/formation-continue"

/* =============================
   BASE URL
============================= */
const API = "/api/admin/demandes-devis"

const DemandeDevisContinuesService = {

  /* =============================
     LISTE PAGINÉE
  ============================= */
  async getAll(
    page = 0,
    size = 10
  ): Promise<PageResponse<DemandeDevisContinue>> {

    const res = await api.get(`${API}?page=${page}&size=${size}`)
    return res.data
  },

  /* =============================
     REPONDRE
  ============================= */
  async repondre(id: number, formData: FormData): Promise<void> {

    await api.post(`${API}/${id}/repondre`, formData)

  },

  /* =============================
     CLOTURER DEMANDE 🔥
  ============================= */
  async cloturer(id: number): Promise<void> {

    await api.post(`${API}/${id}/cloturer`)

  },

  /* =============================
     COMPTER NON TRAITEES
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
     LISTE REPONSES
  ============================= */
  async getReponses(id: number) {

    const res = await api.get(`${API}/${id}/reponses`)
    return res.data

  }

}

export default DemandeDevisContinuesService