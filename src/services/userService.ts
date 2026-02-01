import api from "@/services/api";
import { User } from "@/types/user";

export const UserService = {
  /* ================= LISTE ================= */

  async getAll(): Promise<User[]> {
    const res = await api.get<User[]>("/api/admin/users");
    return res.data;
  },

  /* ================= CREER ADMIN ================= */

  async createAdmin(
    email: string,
    password: string
  ): Promise<void> {
    await api.post("/api/admin/user/create", {
      email,
      password,
    });
  },

  /* ================= ACTIVER ================= */

  async enable(id: number): Promise<void> {
    await api.patch(`/api/admin/users/${id}/activer`);
  },

  /* ================= DESACTIVER ================= */

  async disable(id: number): Promise<void> {
    await api.patch(`/api/admin/users/${id}/desactiver`);
  },

  /* ================= CHANGER MOT DE PASSE (ADMIN) ================= */

  async changePassword(
    userId: number,
    password: string
  ): Promise<void> {
    await api.patch(`/api/admin/users/${userId}/password`, {
      password,
    });
  },

  /* ================= CREER SUPERADMIN (ONE-SHOT) ================= */

  async createSecondSuperAdmin(
    email: string,
    password: string
  ): Promise<void> {
    await api.post("/api/system/superadmin/create", {
      email,
      password,
    });
  },
};
