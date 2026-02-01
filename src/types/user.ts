export enum UserRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  enabled: boolean;
}
