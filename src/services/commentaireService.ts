import api from "@/services/api";
import { Commentaire } from "@/types/commentaire";

export const CommentaireService = {
  getAll(): Promise<Commentaire[]> {
    return api.get("/api/admin/commentaires").then(r => r.data);
  },

  create(
    data: {
      authorName: string;
      content: string;
      displayDate: string;
      displayOrder: number;
      enabled: boolean;
    },
    authorImage: File
  ): Promise<Commentaire> {
    const formData = new FormData();

    formData.append(
      "request",
      new Blob([JSON.stringify(data)], {
        type: "application/json",
      })
    );
    formData.append("authorImage", authorImage);

    return api
      .post("/api/admin/commentaires", formData)
      .then(r => r.data);
  },

  update(
    id: number,
    data: Partial<{
      authorName: string;
      content: string;
      displayDate: string;
      displayOrder: number;
      enabled: boolean;
    }>
  ): Promise<Commentaire> {
    return api
      .put(`/api/admin/commentaires/${id}`, data)
      .then(r => r.data);
  },

  delete(id: number): Promise<void> {
    return api.delete(`/api/admin/commentaires/${id}`);
  },
};
