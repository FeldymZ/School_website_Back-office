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

  /**
   * @param replied  undefined = all messages, false = pending only, true = replied only.
   *                 ASSUMPTION: the backend endpoint accepts a `replied` query param
   *                 and filters on it. If it doesn't yet, this param will be sent but
   *                 silently ignored server-side until that support is added.
   */
  async search(
    q: string,
    page: number,
    size = 10,
    replied?: boolean
  ): Promise<PageResponse<ContactMessage>> {
    const res = await api.get(
      "/api/admin/contact/messages/page",
      { params: { q, page, size, replied } }
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