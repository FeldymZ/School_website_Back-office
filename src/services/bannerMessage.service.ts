import api from "./api";
import type { BannerMessage } from "@/types/bannerMessage";

export const BannerMessageService = {
  getAll(): Promise<BannerMessage[]> {
    return api.get("/api/admin/banner-message").then(res => res.data);
  },

  create(data: FormData): Promise<BannerMessage> {
    return api.post("/api/admin/banner-message", data).then(res => res.data);
  },

  update(id: number, data: FormData): Promise<BannerMessage> {
    return api.put(`/api/admin/banner-message/${id}`, data).then(res => res.data);
  },

  toggleActive(id: number, active: boolean): Promise<BannerMessage> {
    return api.put(
      `/api/admin/banner-message/${id}/active`,
      null,
      { params: { active } }
    ).then(res => res.data);
  },

  delete(id: number): Promise<void> {
    return api.delete(`/api/admin/banner-message/${id}`);
  },
};
