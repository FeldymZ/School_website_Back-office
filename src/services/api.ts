import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios"

import { API_CONFIG } from "../config/api"
import { getToken } from "../utils/auth"

/* ================= AXIOS INSTANCE ================= */

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: false,
  timeout: 900000,
})

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    const token = getToken()

    if (token) {

      console.log("TOKEN BRUT :", token)

      const cleanToken = token
        .replace(/^"|"$/g, "")
        .replace("Bearer ", "")

      console.log("TOKEN NETTOYÉ :", cleanToken)

      // ✅ CORRECTION ICI (important)
      config.headers.Authorization = `Bearer ${cleanToken}`

    } else {
      console.warn("⚠️ Aucun token trouvé")
    }

    return config
  },
  (error) => Promise.reject(error)
)

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(

  (response) => response,

  async (error: AxiosError) => {

    if (!error.response) {
      return Promise.reject(error)
    }

    const status = error.response.status

    if (status === 401) {
      console.error("❌ 401 Unauthorized")
      console.error("Endpoint :", error.config?.url)
      console.error("Data :", error.response?.data)
    }

    if (status === 403) {
      console.warn("⛔ Accès refusé (403)")
    }

    return Promise.reject(error)

  }
)

export default api