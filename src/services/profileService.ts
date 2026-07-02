// src/services/profileService.ts
import api from "@/services/api"
import { User } from "@/types/user"

export const ProfileService = {
  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/api/me")
    return data
  },
}