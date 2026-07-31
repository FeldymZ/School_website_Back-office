export enum UserRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  hasPhoto: boolean;
  role: UserRole;
  enabled: boolean;
  menuAccess: string[];
}

export interface CreateAdminPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  menuAccess: string[];
}

export interface UpdateUserInfoPayload {
  nom: string;
  prenom: string;
  email: string;
  removePhoto: boolean;
}

// 🆕 Payload pour créer le second SUPERADMIN
export interface CreateSuperAdminPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}