export interface Commentaire {
  id: number;
  authorName: string;
  content: string;
  displayDate: string;
  authorImageUrl: string;

  // état
  enabled: boolean;

  // ordre d’affichage (admin)
  displayOrder: number;
}
