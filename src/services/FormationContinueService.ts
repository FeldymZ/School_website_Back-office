import api from "@/services/api";
import {
  FormationContinue,
  PageResponse,
} from "@/types/formation-continue";

export const FormationContinueService = {
  /* =========================
     LISTE PAGINÉE (ADMIN)
     ========================= */
  async getAll(
    page = 0,
    size = 10
  ): Promise<PageResponse<FormationContinue>> {
    const res = await api.get<PageResponse<FormationContinue>>(
      `/api/admin/formations-continues?page=${page}&size=${size}`
    );
    return res.data;
  },

  /* =========================
     DÉTAIL
     ========================= */
  async getById(id: number): Promise<FormationContinue> {
    const res = await api.get<FormationContinue>(
      `/api/admin/formations-continues/${id}`
    );
    return res.data;
  },

  /* =========================
     CRÉATION
     ========================= */
  async create(formData: FormData): Promise<FormationContinue> {
    const res = await api.post<FormationContinue>(
      "/api/admin/formations-continues",
      formData
    );
    return res.data;
  },

  /* =========================
     UPDATE
     ========================= */
  async update(
    id: number,
    formData: FormData
  ): Promise<FormationContinue> {
    const res = await api.put<FormationContinue>(
      `/api/admin/formations-continues/${id}`,
      formData
    );
    return res.data;
  },

  /* =========================
     TOGGLE
     ========================= */
  async toggle(id: number): Promise<void> {
    await api.patch(`/api/admin/formations-continues/${id}/toggle`);
  },

  /* =========================
     DELETE
     ========================= */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/admin/formations-continues/${id}`);
  },
};
