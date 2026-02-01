import axios from "axios";
import { API_CONFIG } from "../config/api";
import { saveToken } from "../utils/auth";

/* ================= TYPES ================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

/* ================= LOGIN ================= */

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`,
    data,
    { withCredentials: true }
  );

  const { accessToken } = response.data;

  // 🔐 sauvegarde UNIQUE du token
  saveToken(accessToken);

  return response.data;
};
