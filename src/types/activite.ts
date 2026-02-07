export enum ActiviteMediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

/* =======================
   MEDIA
   ======================= */
export interface ActiviteMedia {
  id: number;
  url: string;
  type: ActiviteMediaType;
}

/* =======================
   LISTE (ADMIN) ✅
   ======================= */
export interface Activite {
  id: number;
  titre: string;
  slug: string;
  medias: ActiviteMedia[]; // ✅ OBLIGATOIRE
}

/* =======================
   DÉTAILS (ADMIN)
   ======================= */
export interface ActiviteDetails extends Activite {
  contenu: string;
}
