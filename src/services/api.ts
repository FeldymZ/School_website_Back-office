import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "../config/api";
import { getToken, clearToken } from "../utils/auth";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: false,
  timeout: 900000, // ✅ 30 secondes timeout
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
let isRefreshing = false;

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    console.error("❌ Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Pas de réponse du serveur (réseau coupé, etc.)
    if (!error.response) {
      console.error("❌ Erreur réseau - Pas de réponse du serveur");
      return Promise.reject(error);
    }

    // Éviter les boucles infinies
    if (originalRequest._retry) {
      console.log("⚠️ Retry déjà tenté, abandon");
      return Promise.reject(error);
    }

    // 401 = Token invalide/expiré
    if (error.response.status === 401) {
      console.warn("⚠️ Token expiré ou invalide (401)");

      // Éviter les redirections multiples
      if (!isRefreshing) {
        isRefreshing = true;

        console.log("🚪 Déconnexion et redirection vers /login");
        clearToken();

        // Attendre un peu avant de rediriger
        setTimeout(() => {
          isRefreshing = false;
          window.location.href = "/login";
        }, 100);
      }

      return Promise.reject(error);
    }

    // 403 = Accès refusé (droits insuffisants)
    if (error.response.status === 403) {
      console.warn("⚠️ Accès refusé (403) - Droits insuffisants");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
