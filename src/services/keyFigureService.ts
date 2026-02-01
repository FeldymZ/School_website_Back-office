import api from "@/services/api";
import type {
  KeyFigure,
  KeyFigureRequest,
  KeyFigureOrderRequest,
} from "@/types/keyFigure";

/* ================= KEY FIGURE SERVICE ================= */

export const KeyFigureService = {
  /* ================= LIST ================= */

  async getAll(): Promise<KeyFigure[]> {
    const res = await api.get<KeyFigure[]>(
      "/api/admin/key-figures"
    );
    return res.data;
  },

  /* ================= CREATE ================= */

  async create(
    data: KeyFigureRequest
  ): Promise<KeyFigure> {
    const res = await api.post<KeyFigure>(
      "/api/admin/key-figures",
      data
    );
    return res.data;
  },

  /* ================= UPDATE ================= */

  async update(
    id: number,
    data: Partial<KeyFigureRequest>
  ): Promise<KeyFigure> {
    const res = await api.put<KeyFigure>(
      `/api/admin/key-figures/${id}`,
      data
    );
    return res.data;
  },

  /* ================= DELETE ================= */

  async delete(id: number): Promise<void> {
    await api.delete(
      `/api/admin/key-figures/${id}`
    );
  },

  /* ================= REORDER ================= */

  async reorder(
    orders: KeyFigureOrderRequest[]
  ): Promise<void> {
    await api.put(
      "/api/admin/key-figures/reorder",
      orders
    );
  },
};
