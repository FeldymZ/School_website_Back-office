export interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export const decodeJwt = <T = JwtPayload>(
  token: string
): T | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(
      payload.replace(/-/g, "+").replace(/_/g, "/")
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
