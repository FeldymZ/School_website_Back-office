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
  enabled: boolean;
}

/* ============================
   GALERIE IMAGE
   ============================ */
export interface FormationGalleryImage {
  id: number;
  url: string;            // ✅ url simple
  displayOrder: number;
}

/* ============================
   DÉTAILS (ADMIN)
   ============================ */
export interface FormationDetails extends Formation {
  description?: string;
  galleryImages: FormationGalleryImage[];
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
