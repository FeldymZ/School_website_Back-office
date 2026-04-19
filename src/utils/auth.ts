import { decodeJwt } from "./jwt"
import { UserRole } from "@/types/user"

/* ================= TYPES ================= */

interface JwtPayload {
  sub?: string
  role?: UserRole
  exp?: number
  iat?: number
}

/* ================= TOKEN ================= */

const TOKEN_KEY = "esiitech_token"

/* ===== SAVE ===== */
export const saveToken = (token: string): void => {
  console.log("🔐 Token sauvegardé")
  localStorage.setItem(TOKEN_KEY, token)
}

/* ===== GET (🔥 CORRIGÉ) ===== */
export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    console.log("❌ Aucun token trouvé")
    return null
  }

  try {
    const payload = decodeJwt<JwtPayload>(token)

    if (!payload?.exp) {
      console.log("❌ Token invalide (pas de exp)")
      clearToken()
      return null
    }

    const now = Math.floor(Date.now() / 1000)

    if (payload.exp <= now) {
      console.log("⏰ Token expiré → suppression")
      clearToken()
      return null
    }

    console.log("🔑 Token valide")
    return token

  } catch (error) {
    console.error("❌ Token corrompu :", error)
    clearToken()
    return null
  }
}

/* ===== CLEAR ===== */
export const clearToken = (): void => {
  console.log("🗑️ Token supprimé")
  localStorage.removeItem(TOKEN_KEY)
}

/* ================= USER ================= */

export const getUserFromToken = (): {
  email: string
  role: UserRole
} | null => {

  const token = getToken()
  if (!token) return null

  try {
    const payload = decodeJwt<JwtPayload>(token)

    if (!payload?.sub || !payload?.role) {
      console.log("❌ Token incomplet")
      return null
    }

    return {
      email: payload.sub,
      role: payload.role,
    }

  } catch (error) {
    console.error("❌ Erreur décodage token:", error)
    return null
  }
}

/* ================= AUTH ================= */

export const isAuthenticated = (): boolean => {
  return getUserFromToken() !== null
}

/* ================= ROLE ================= */

export const getUserRole = (): UserRole | null => {
  const user = getUserFromToken()
  return user?.role ?? null
}

export const isSuperAdmin = (): boolean => {
  return getUserRole() === UserRole.SUPERADMIN
}

/* ================= LOGOUT ================= */

export const logout = (): void => {
  console.log("🚪 Déconnexion")
  clearToken()
  window.location.href = "/login"
}