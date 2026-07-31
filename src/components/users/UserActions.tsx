export enum UserRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  hasPhoto: boolean; // 🆕 indique si une photo existe ; à charger via GET /api/admin/users/{id}/photo
  role: UserRole;
  enabled: boolean;
  menuAccess: string[];
}

// 🆕 Payload envoyé lors de la création d'un ADMIN (sans la photo, envoyée à part en multipart)
export interface CreateAdminPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  menuAccess: string[];
}