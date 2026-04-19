export interface Categorie {
  id: number
  libelle: string
}

export interface SousCategorie {
  id: number
  libelle: string
  categorieId?: number
}