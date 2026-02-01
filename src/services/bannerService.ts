import api from "@/services/api";
import { Banner, BannerUpdatePayload } from "@/types/banner";

export const BannerService = {
  getAll: async (): Promise<Banner[]> => {
    const res = await api.get("/api/admin/banners");
    return res.data;
  },

  reorder: async (
    orders: { id: number; displayOrder: number }[]
  ): Promise<void> => {
    await api.put("/api/admin/banners/reorder", orders);
  },

  create: async (form: FormData): Promise<Banner> => {
    const res = await api.post("/api/admin/banners", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (
    id: number,
    payload: BannerUpdatePayload
  ): Promise<Banner> => {
    const res = await api.put(
      `/api/admin/banners/${id}`,
      payload
    );
    return res.data;
  },

  enable: async (id: number): Promise<Banner> => {
    const res = await api.put(`/api/admin/banners/${id}/enable`);
    return res.data;
  },

  disable: async (id: number): Promise<Banner> => {
    const res = await api.put(`/api/admin/banners/${id}/disable`);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/banners/${id}`);
  },
};
