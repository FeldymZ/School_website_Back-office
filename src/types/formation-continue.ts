import { UniteDuree } from "@/types/common"

/* ============================
   RELATIONS
   ============================ */

export interface CategorieLight {
  id: number
  libelle: string
}

export interface SousCategorieLight {
  id: number
  libelle: string
  categorieId?: number
}

/* ============================
   FORMATION
   ============================ */

export interface FormationContinue {

    coverUrl?: string

  id: number

  reference: number

  libelle: string
  description: string

  objectifs?: string
  competences?: string

  prix?: number

  duree?: number
  uniteDuree?: UniteDuree

  lieu?: string
  titreDelivre?: string

  logo?: string

  enabled: boolean

  sousCategorie?: SousCategorieLight
}

/* ============================
   PAGE SPRING
   ============================ */

export interface PageResponse<T> {

  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number

}