import api from "@/services/api";
import {
  Actualite,
  ActualiteDetails,
  ActualiteUpdateRequest,
  ActualitePublicationHistory,
} from "@/types/actualite";

export const ActualiteService = {
  /* =========================
     LISTE / DÉTAIL
     ========================= */

  getAll(): Promise<Actualite[]> {
    return api.get<Actualite[]>("/api/admin/actualites")
      .then(res => res.data);
  },

  getDetails(id: number): Promise<ActualiteDetails> {
    return api.get<ActualiteDetails>(`/api/admin/actualites/${id}`)
      .then(res => res.data);
  },

  /* =========================
     CRÉATION / UPDATE
     ========================= */

  create(formData: FormData): Promise<Actualite> {
    return api.post<Actualite>("/api/admin/actualites", formData)
      .then(res => res.data);
  },

  update(
    id: number,
    data: ActualiteUpdateRequest
  ): Promise<Actualite> {
    return api.put<Actualite>(
      `/api/admin/actualites/${id}`,
      data
    ).then(res => res.data);
  },

  updateCover(id: number, file: File): Promise<Actualite> {
    const formData = new FormData();
    formData.append("coverImage", file);

    return api.put<Actualite>(
      `/api/admin/actualites/${id}/cover`,
      formData
    ).then(res => res.data);
  },

  /* =========================
     GALERIE
     ========================= */

  addImages(id: number, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    return api.post(
      `/api/admin/actualites/${id}/images`,
      formData
    );
  },

  replaceImages(id: number, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    return api.put(
      `/api/admin/actualites/${id}/images`,
      formData
    );
  },

  deleteImage(imageId: number): Promise<void> {
    return api.delete(
      `/api/admin/actualites/images/${imageId}`
    );
  },

  /* =========================
     HISTORIQUE / ORDRE
     ========================= */

  getHistory(id: number): Promise<ActualitePublicationHistory[]> {
    return api.get<ActualitePublicationHistory[]>(
      `/api/admin/actualites/${id}/history`
    ).then(res => res.data);
  },

  reorder(orderedIds: number[]): Promise<void> {
    return api.put(
      "/api/admin/actualites/reorder",
      { orderedIds }
    );
  },

  delete(id: number): Promise<void> {
    return api.delete(`/api/admin/actualites/${id}`);
  },
};
