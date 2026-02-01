import { decodeJwt } from "./jwt";
import { UserRole } from "@/types/user";

/* ================= TYPES ================= */

interface JwtPayload {
  sub?: string;   // email
  role?: UserRole;
  exp?: number;   // expiration (seconds)
  iat?: number;
}

/* ================= TOKEN ================= */

const TOKEN_KEY = "esiitech_token";

export const saveToken = (token: string): void => {
  console.log("🔐 Token sauvegardé");
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log(token ? "🔑 Token récupéré" : "❌ Aucun token trouvé");
  return token;
};

export const clearToken = (): void => {
  console.log("🗑️ Token supprimé");
  localStorage.removeItem(TOKEN_KEY);
};

/* ================= USER ================= */

export const getUserFromToken = (): {
  email: string;
  role: UserRole;
} | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = decodeJwt<JwtPayload>(token);

    if (!payload?.sub || !payload?.role || !payload?.exp) {
      console.log("❌ Token incomplet");
      return null;
    }

    // ✅ JWT exp est en SECONDES
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      console.log("⏰ Token expiré");
      return null;
    }

    return {
      email: payload.sub,
      role: payload.role,
    };
  } catch (error) {
    console.error("❌ Erreur décodage token:", error);
    return null;
  }
};

/* ================= AUTH ================= */

/**
 * ✅ UNE SEULE SOURCE DE VÉRITÉ
 * Si le token est valide et décodable → authentifié
 */
export const isAuthenticated = (): boolean => {
  return getUserFromToken() !== null;
};

/* ================= ROLE ================= */

export const getUserRole = (): UserRole | null => {
  const user = getUserFromToken();
  return user?.role ?? null;
};

export const isSuperAdmin = (): boolean => {
  return getUserRole() === UserRole.SUPERADMIN;
};

/* ================= LOGOUT ================= */

export const logout = (): void => {
  console.log("🚪 Déconnexion");
  clearToken();
};
