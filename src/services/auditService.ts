import api from "@/services/api";
import type { AdminAuditLog } from "@/types/audit";
export const AuditService = {
  /* ================= TOUS LES LOGS ================= */

  async getAll(): Promise<AdminAuditLog[]> {
    const res = await api.get<AdminAuditLog[]>("/api/admin/audit");
    return res.data;
  },

  /* ================= FILTRE PAR ADMIN ================= */

  async byAdmin(email: string): Promise<AdminAuditLog[]> {
    const res = await api.get<AdminAuditLog[]>(
      "/api/admin/audit/by-admin",
      {
        params: { email },
      }
    );
    return res.data;
  },

  /* ================= FILTRE PAR DATE ================= */

  async byDate(
    start: string,
    end: string
  ): Promise<AdminAuditLog[]> {
    const res = await api.get<AdminAuditLog[]>(
      "/api/admin/audit/by-date",
      {
        params: { start, end },
      }
    );
    return res.data;
  },
};
