import api from "@/services/api";
import {
  Activite,
  ActiviteDetails,
} from "@/types/activite";

export const ActiviteService = {
  /* =====================
     LISTE
     ===================== */
  async getAll(): Promise<Activite[]> {
    const res = await api.get<Activite[]>(
      "/api/admin/activites"
    );
    return res.data;
  },

  /* =====================
     DÉTAILS
     ===================== */
  async getById(id: number): Promise<ActiviteDetails> {
    const res = await api.get<ActiviteDetails>(
      `/api/admin/activites/${id}`
    );
    return res.data;
  },

  /* =====================
     CRÉATION
     ===================== */
  async create(formData: FormData): Promise<ActiviteDetails> {
    const res = await api.post(
      "/api/admin/activites",
      formData
    );
    return res.data;
  },

  /* =====================
     UPDATE TEXTE
     ===================== */
  async update(
    id: number,
    payload: { titre: string; contenu: string }
  ): Promise<void> {
    await api.put(
      `/api/admin/activites/${id}`,
      payload
    );
  },

  /* =====================
     ADD MEDIAS
     ===================== */
  async addMedias(
    id: number,
    formData: FormData
  ): Promise<void> {
    await api.post(
      `/api/admin/activites/${id}/medias`,
      formData
    );
  },

  /* =====================
     DELETE MEDIA
     ===================== */
  async deleteMedia(mediaId: number): Promise<void> {
    await api.delete(
      `/api/admin/activites/medias/${mediaId}`
    );
  },

  /* =====================
     DELETE ACTIVITÉ
     ===================== */
  async delete(id: number): Promise<void> {
    await api.delete(
      `/api/admin/activites/${id}`
    );
  },
};
