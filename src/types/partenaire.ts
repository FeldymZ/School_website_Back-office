export interface Partenaire {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  displayOrder: number;
  enabled: boolean;
}
