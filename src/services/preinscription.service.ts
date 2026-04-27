import api from "@/services/api";
import {
  PreinscriptionDemande,
  PreinscriptionEmetteur,
  SessionUniversitaire,
  PreinscriptionPeriode,
} from "@/types/preinscription";

/* =====================================================
   🔧 HELPER
===================================================== */
const handleError = (error: any) => {
  console.error("❌ API ERROR:", error?.response?.data || error.message);
  throw error;
};

export const PreinscriptionService = {

  /* =====================================================
     📌 DEMANDES
  ===================================================== */

  async getAll(): Promise<PreinscriptionDemande[]> {
    try {
      const res = await api.get("/api/admin/preinscriptions");
      return res.data;
    } catch (e) {
      handleError(e);
      return [];
    }
  },

  async getById(id: number): Promise<PreinscriptionDemande> {
    try {
      const res = await api.get(`/api/admin/preinscriptions/${id}`);
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  async validate(id: number): Promise<PreinscriptionDemande> {
    try {
      const res = await api.post(`/api/admin/preinscriptions/${id}/valider`);
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  async reject(id: number): Promise<void> {
    try {
      await api.post(`/api/admin/preinscriptions/${id}/rejeter`);
    } catch (e) {
      handleError(e);
    }
  },

  /* =====================================================
     📌 EMETTEURS
  ===================================================== */

  async getAllEmetteurs(): Promise<PreinscriptionEmetteur[]> {
    try {
      const res = await api.get("/api/admin/preinscriptions/emetteurs");
      return res.data;
    } catch (e) {
      handleError(e);
      return [];
    }
  },

  async createEmetteur(
    nom: string,
    fonction: string,
    signature: File
  ): Promise<void> {
    if (!signature) throw new Error("Signature obligatoire");

    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("fonction", fonction);
      formData.append("signature", signature);

      await api.post("/api/admin/preinscriptions/emetteurs", formData);
    } catch (e) {
      handleError(e);
    }
  },

  /* 🔥 FIX UPDATE AVEC SIGNATURE OPTIONNELLE */
  async updateEmetteur(
    id: number,
    data: { nom: string; fonction: string },
    signature?: File
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("nom", data.nom);
      formData.append("fonction", data.fonction);

      if (signature) {
        formData.append("signature", signature);
      }

      await api.put(`/api/admin/preinscriptions/emetteurs/${id}`, formData);
    } catch (e) {
      handleError(e);
    }
  },

  async deleteEmetteur(id: number): Promise<void> {
    try {
      await api.delete(`/api/admin/preinscriptions/emetteurs/${id}`);
    } catch (e) {
      handleError(e);
    }
  },

  /* =====================================================
     📌 SESSIONS
  ===================================================== */

  async getSessions(): Promise<SessionUniversitaire[]> {
    try {
      const res = await api.get("/api/admin/preinscriptions/sessions");
      return res.data;
    } catch (e) {
      handleError(e);
      return [];
    }
  },

  async createSession(data: { annee: string }): Promise<void> {
    try {
      await api.post("/api/admin/preinscriptions/sessions", data);
    } catch (e) {
      handleError(e);
    }
  },

  async updateSession(id: number, data: { annee: string }): Promise<void> {
    try {
      await api.put(`/api/admin/preinscriptions/sessions/${id}`, data);
    } catch (e) {
      handleError(e);
    }
  },

  async deleteSession(id: number): Promise<void> {
    try {
      await api.delete(`/api/admin/preinscriptions/sessions/${id}`);
    } catch (e) {
      handleError(e);
    }
  },

  /* =====================================================
     📌 PERIODES
  ===================================================== */

  async getPeriodes(): Promise<PreinscriptionPeriode[]> {
    try {
      const res = await api.get("/api/admin/preinscriptions/periodes");
      return res.data;
    } catch (e) {
      handleError(e);
      return [];
    }
  },

  async createPeriode(data: {
    sessionId: number;
    emetteurId: number;
    dateDebut: string;
    dateFin: string;
  }): Promise<void> {
    try {
      await api.post("/api/admin/preinscriptions/periodes", data);
    } catch (e) {
      handleError(e);
    }
  },

  async updatePeriode(
    id: number,
    data: {
      dateDebut: string;
      dateFin: string;
      sessionId?: number;
      emetteurId?: number;
    }
  ): Promise<void> {
    try {
      await api.put(`/api/admin/preinscriptions/periodes/${id}`, data);
    } catch (e) {
      handleError(e);
    }
  },

  async deactivatePeriode(id: number): Promise<void> {
    try {
      await api.put(
        `/api/admin/preinscriptions/periodes/${id}/desactiver`
      );
    } catch (e) {
      handleError(e);
    }
  },

  async deletePeriode(id: number): Promise<void> {
    try {
      await api.delete(`/api/admin/preinscriptions/periodes/${id}`);
    } catch (e) {
      handleError(e);
    }
  },

};