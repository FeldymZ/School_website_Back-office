import api from "@/services/api";
import { Partenaire } from "@/types/partenaire";

export const PartenaireService = {
  /* ================= ADMIN ================= */

  async getAll(): Promise<Partenaire[]> {
    const { data } = await api.get("/api/admin/partenaires");
    return data;
  },

  async create(formData: FormData): Promise<Partenaire> {
    const { data } = await api.post(
      "/api/admin/partenaires",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

 async update(
  id: number,
  payload: {
    name?: string;
    websiteUrl?: string | null;
    displayOrder?: number;
    enabled?: boolean;
  }
): Promise<Partenaire> {
  const formData = new FormData();

  if (payload.name !== undefined)
    formData.append("name", payload.name);

  if (payload.websiteUrl !== undefined && payload.websiteUrl !== null)
    formData.append("websiteUrl", payload.websiteUrl);

  if (payload.displayOrder !== undefined)
    formData.append("displayOrder", String(payload.displayOrder));

  if (payload.enabled !== undefined)
    formData.append("enabled", String(payload.enabled));

  const { data } = await api.put(
    `/api/admin/partenaires/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
},


  async updateLogo(id: number, logo: File): Promise<Partenaire> {
    const formData = new FormData();
    formData.append("logo", logo);

    const { data } = await api.put(
      `/api/admin/partenaires/${id}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/admin/partenaires/${id}`);
  },

  /* ================= REORDER (FIX ICI) ================= */

  async reorder(orderedIds: number[]): Promise<void> {
    await api.put("/api/admin/partenaires/reorder", {
      orderedIds,
    });
  },
};
