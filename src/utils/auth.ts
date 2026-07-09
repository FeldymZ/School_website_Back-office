import { decodeJwt } from "./jwt";
import { UserRole } from "@/types/user";

/* ================= TYPES ================= */

interface JwtPayload {
  sub?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
}

/* ================= TOKEN ================= */

const TOKEN_KEY = "esiitech_token";

/* ================= SAVE ================= */

export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/* ================= GET ================= */

export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  try {
    const payload = decodeJwt<JwtPayload>(token);

    if (!payload?.exp) {
      clearToken();
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      clearToken();
      return null;
    }

    return token;
  } catch {
    clearToken();
    return null;
  }
};

/* ================= CLEAR ================= */

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/* ================= USER ================= */

export const getUserFromToken = (): {
  email: string;
  role: UserRole;
} | null => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = decodeJwt<JwtPayload>(token);

    if (!payload?.sub || !payload?.role) {
      return null;
    }

    return {
      email: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

/* ================= AUTH ================= */

export const isAuthenticated = (): boolean => {
  return getUserFromToken() !== null;
};

/* ================= ROLE ================= */

export const getUserRole = (): UserRole | null => {
  return getUserFromToken()?.role ?? null;
};

export const isSuperAdmin = (): boolean => {
  return getUserRole() === UserRole.SUPERADMIN;
};

/* ================= LOGOUT ================= */

export const logout = (): void => {
  clearToken();
  window.location.href = "/login";
};