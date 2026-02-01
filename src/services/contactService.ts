import api from "@/services/api";
import type { ContactMessage, PageResponse } from "@/types/contact";

export const ContactService = {
  async getAll(): Promise<ContactMessage[]> {
    const res = await api.get("/api/admin/contact/messages");
    return res.data;
  },

  async getUnreplied(): Promise<ContactMessage[]> {
    const res = await api.get("/api/admin/contact/messages/unreplied");
    return res.data;
  },

  async getOne(id: number): Promise<ContactMessage> {
    const res = await api.get(`/api/admin/contact/messages/${id}`);
    return res.data;
  },

  async search(
    q: string,
    page: number,
    size = 10
  ): Promise<PageResponse<ContactMessage>> {
    const res = await api.get(
      "/api/admin/contact/messages/page",
      { params: { q, page, size } }
    );
    return res.data;
  },

  async reply(
    id: number,
    replyMessage: string,
    attachment?: File
  ): Promise<void> {
    const fd = new FormData();
    fd.append("replyMessage", replyMessage);
    if (attachment) fd.append("attachment", attachment);

    await api.put(
      `/api/admin/contact/messages/${id}/reply`,
      fd
    );
  },
};
