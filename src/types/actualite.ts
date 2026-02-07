export interface Actualite {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string;
  publishedAt: string | null;
}

export interface ActualiteGalleryImage {
  id: number;
  url: string;          // ✅ EXACTEMENT comme le backend
  displayOrder: number;
}



export interface ActualiteDetails {
  id: number;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;

  // 🌍 PUBLIC
  galleryImages: string[];

  // 🔐 ADMIN
  galleryImagesAdmin: ActualiteGalleryImage[];

  displayOrder: number | null;
  publishedAt: string | null;
}

export interface ActualiteUpdateRequest {
  title?: string;
  content?: string;
  displayOrder?: number;
  enabled?: boolean;
}

export interface ActualitePublicationHistory {
  action: "PUBLISHED" | "UNPUBLISHED";
  actionDate: string;
}
