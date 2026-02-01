export interface KeyFigure {
  id: number;
  label: string;        // ex: "Étudiants"
  value: string;        // ex: "2500+"
  displayOrder: number; // ordre d’affichage
  enabled: boolean;     // actif / inactif
}

/* ================= REQUESTS ================= */

export interface KeyFigureRequest {
  label: string;
  value: string;
  displayOrder: number;
  enabled?: boolean;
}

export interface KeyFigureOrderRequest {
  id: number;
  displayOrder: number;
}
