// src/services/menuPermissionsService.ts
import api from "@/services/api"

export const MenuPermissionsService = {
  async getAll(): Promise<string[]> {
    const { data } = await api.get<string[]>("/api/menu-permissions")
    return data
  },
}