export interface AdminAuditLog {
  id: number;
  actorEmail: string;
  action: string;
  target: string;
  createdAt: string; // ISO string
}
