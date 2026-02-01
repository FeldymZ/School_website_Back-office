/* ============================
   ENUM
   ============================ */
export enum FormationLevel {
  LICENCE = "LICENCE",
  MASTER = "MASTER",
}

/* ============================
   LISTE (ADMIN)
   ============================ */
export interface Formation {
  id: number;
  title: string;
  coverImageUrl: string;
  level: FormationLevel;
}

/* ============================
   DÉTAILS (ADMIN)
   ============================ */
export interface FormationDetails extends Formation {
  description?: string;
  galleryImages: string[];
  pdfUrl?: string;
}

/* ============================
   UPDATE REQUEST
   ============================ */
export interface FormationUpdateRequest {
  name?: string;
  description?: string;
  level?: FormationLevel;
  displayOrder?: number;
  enabled?: boolean;
}

/* ============================
   IMAGE ORDER REQUEST
   ============================ */
export interface FormationImageOrderRequest {
  id: number;
  displayOrder: number;
}
