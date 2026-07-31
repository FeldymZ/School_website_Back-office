import api from "@/services/api";
import { User, CreateAdminPayload, UpdateUserInfoPayload, CreateSuperAdminPayload } from "@/types/user";

const buildMultipart = (data: unknown, photo?: File | null) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (photo) formData.append("photo", photo);
  return formData;
};

export const UserService = {
  /* ================= LISTE ================= */

  async getAll(): Promise<User[]> {
    const res = await api.get<User[]>("/api/admin/users");
    return res.data;
  },

  /* ================= MOI-MEME ================= */

  async getMe(): Promise<User> {
    const res = await api.get<User>("/api/me");
    return res.data;
  },

  async getMyPhotoUrl(): Promise<string | null> {
    try {
      const res = await api.get("/api/me/photo", { responseType: "blob" });
      return URL.createObjectURL(res.data as Blob);
    } catch {
      return null;
    }
  },

  async updateMyInfo(payload: UpdateUserInfoPayload, photo?: File | null): Promise<User> {
    const res = await api.patch<User>("/api/me", buildMultipart(payload, photo), {
      headers: { "Content-Type": undefined },
    });
    return res.data;
  },

  /* ================= CREER ADMIN (multipart avec photo) ================= */

  async createAdmin(payload: CreateAdminPayload, photo?: File | null): Promise<void> {
    await api.post("/api/admin/user/create", buildMultipart(payload, photo), {
      headers: { "Content-Type": undefined },
    });
  },

  /* ================= MODIFIER UN AUTRE UTILISATEUR ================= */

  async updateAdminInfo(id: number, payload: UpdateUserInfoPayload, photo?: File | null): Promise<User> {
    const res = await api.patch<User>(`/api/admin/users/${id}/info`, buildMultipart(payload, photo), {
      headers: { "Content-Type": undefined },
    });
    return res.data;
  },

  /* ================= PHOTO (autre utilisateur, gestion admin) ================= */

  async getPhotoUrl(userId: number): Promise<string | null> {
    try {
      const res = await api.get(`/api/admin/users/${userId}/photo`, {
        responseType: "blob",
      });
      return URL.createObjectURL(res.data as Blob);
    } catch {
      return null;
    }
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

  /* ================= GERER LES MENUS ================= */

  async updateMenuAccess(
    userId: number,
    menuAccess: string[]
  ): Promise<void> {
    await api.patch(`/api/admin/users/${userId}/menu-access`, {
      menuAccess,
    });
  },

  /* ================= CREER SUPERADMIN (ONE-SHOT) ================= */

  async createSecondSuperAdmin(payload: CreateSuperAdminPayload): Promise<void> {
    await api.post("/api/system/superadmin/create", payload);
  },
};