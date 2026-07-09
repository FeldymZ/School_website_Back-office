import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { API_CONFIG } from "../config/api";
import { getToken, logout } from "../utils/auth";

/* ================= AXIOS INSTANCE ================= */

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: false,
  timeout: 900000,
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(

  (response) => response,

  async (error: AxiosError) => {

    if (!error.response) {
      return Promise.reject(error);
    }

    switch (error.response.status) {

      case 401:
        logout();
        break;

      case 403:
        // L'utilisateur est authentifié mais n'a pas les droits.
        break;

      case 500:
        // Erreur serveur.
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;