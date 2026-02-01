export interface Actualite {
  id: number;
  title: string;
  coverImageUrl: string;
  publishedAt: string | null;
}

export interface ActualiteDetails {
  id: number;
  title: string;
  content: string;
  coverImageUrl: string;
  galleryImages: string[];
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
