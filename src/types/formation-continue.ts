/* ============================
   FORMATION CONTINUE (LIST)
   ============================ */

export interface FormationContinue {
  id: number;
  titre: string;
  slug: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  enabled: boolean;
}

/* ============================
   PAGE SPRING DATA
   ============================ */

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/* ============================
   CREATE / UPDATE REQUEST
   ============================ */

export interface FormationContinueFormData {
  titre: string;
  description: string;
  cover?: File | null;
  pdf?: File | null;
}
