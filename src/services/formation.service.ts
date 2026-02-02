import api from "@/services/api";
import {
  Formation,
  FormationDetails,
  FormationUpdateRequest,
  FormationImageOrderRequest,
} from "@/types/formation";

export const FormationService = {
  /* ============================
     LISTE
     ============================ */
  async getAll(): Promise<Formation[]> {
    const res = await api.get<Formation[]>(
      "/api/admin/formations/initiale"
    );
    return res.data;
  },

  /* ============================
     DÉTAILS
     ============================ */
  async getDetails(id: number): Promise<FormationDetails> {
    const res = await api.get<FormationDetails>(
      `/api/admin/formations/initiale/${id}`
    );
    return res.data;
  },

  /* ============================
     CRÉATION
     ============================ */
  async create(data: FormData): Promise<Formation> {
    const res = await api.post<Formation>(
      "/api/admin/formations/initiale",
      data
    );
    return res.data;
  },

  /* ============================
     UPDATE
     ============================ */
  async update(
    id: number,
    payload: FormationUpdateRequest
  ): Promise<Formation> {
    const res = await api.put<Formation>(
      `/api/admin/formations/initiale/${id}`,
      payload
    );
    return res.data;
  },

  /* ============================
     VISIBILITÉ
     ============================ */
  async toggleVisibility(
    id: number,
    enabled: boolean
  ): Promise<Formation> {
    const res = await api.put<Formation>(
      `/api/admin/formations/initiale/${id}`,
      { enabled }
    );
    return res.data;
  },

  /* ============================
     SUPPRESSION
     ============================ */
  async delete(id: number): Promise<void> {
    await api.delete(
      `/api/admin/formations/initiale/${id}`
    );
  },

  /* ============================
     GALERIE
     ============================ */
  async addImages(
    formationId: number,
    images: File[]
  ): Promise<void> {
    const formData = new FormData();
    images.forEach((f) => formData.append("images", f));

    await api.post(
      `/api/admin/formations/initiale/${formationId}/images`,
      formData
    );
  },

  async deleteImage(imageId: number): Promise<void> {
    await api.delete(
      `/api/admin/formations/initiale/images/${imageId}`
    );
  },

  async reorderImages(
    formationId: number,
    orders: FormationImageOrderRequest[]
  ): Promise<void> {
    await api.put(
      `/api/admin/formations/initiale/${formationId}/images/reorder`,
      orders
    );
  },

  /* ============================
     PDF
     ============================ */
  async deletePdf(id: number): Promise<void> {
    await api.delete(
      `/api/admin/formations/initiale/${id}/pdf`
    );
  },

  async updateCover(
    id: number,
    file: File
  ): Promise<void> {
    const formData = new FormData();
    formData.append("cover", file);

    await api.put(
      `/api/admin/formations/initiale/${id}/cover`,
      formData
    );
  },
};
