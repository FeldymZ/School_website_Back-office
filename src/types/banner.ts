export type MediaType = "IMAGE" | "VIDEO";
export type BannerStatus = "ACTIVE" | "PROGRAMMED" | "EXPIRED" | "DISABLED";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  subtitleAlt?: string | null;

  mediaUrl: string;
  mediaType: MediaType;

  displayOrder: number;
  enabled: boolean;

  startAt?: string | null;
  endAt?: string | null;

  buttonLabel?: string | null;
  buttonUrl?: string | null;

  status: BannerStatus;
}


export interface BannerUpdatePayload {
  title?: string | null;
  subtitle?: string | null;
  subtitleAlt?: string | null;

  displayOrder?: number | null;
  enabled?: boolean | null;

  startAt?: string | null; // ISO string
  endAt?: string | null;   // ISO string

  buttonLabel?: string | null;
  buttonUrl?: string | null;
}
