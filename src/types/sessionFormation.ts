/* =========================================================
   SESSION DE FORMATION — types
========================================================= */

export type EtatSession = "A_VENIR" | "EN_COURS" | "TERMINEE"
export type StatutInscription = "EN_ATTENTE" | "CONFIRMEE" | "REFUSEE"

/** Une session (période) d'une formation continue */
export interface SessionFormation {
  id: number
  formationId: number
  formationLibelle: string
  formationSlug: string
  dateDebut: string          // "2026-11-03"
  dateFin: string
  lieu: string | null
  horaires: string | null
  nombrePlaces: number | null // null = illimité
  inscrits: number            // en attente + confirmées
  confirmees: number
  placesRestantes: number | null
  active: boolean             // false = masquée sur le site
  etat: EtatSession
}

export interface SessionFormationPayload {
  formationId: number
  dateDebut: string
  dateFin: string
  lieu: string | null
  horaires: string | null
  nombrePlaces: number | null
  active: boolean
}

export interface FormationOption {
  id: number
  libelle: string
}

/** Demande de participation */
export interface InscriptionSession {
  id: number
  sessionId: number
  formationLibelle: string
  sessionDateDebut: string
  sessionDateFin: string
  sessionLieu: string | null
  nom: string
  prenom: string
  sexe: "M" | "F"
  dateNaissance: string
  lieuNaissance: string
  email: string
  telephone: string
  lieuResidence: string
  enActivite: boolean
  profession: string | null
  statut: StatutInscription
  motifRefus: string | null
  dateInscription: string
  dateTraitement: string | null
  traitePar: string | null
}

export interface InscriptionsStats {
  total: number
  enAttente: number
  confirmees: number
  refusees: number
}


/** En-tête de la page publique « Sessions de formation » */
export interface PageSessionsFormation {
  badge: string | null
  titre: string
  sousTitre: string | null
  image: string | null            // chemin de l'image d'arrière-plan
  dateModification: string | null
  modifiePar: string | null
}

export interface PageSessionsFormationPayload {
  badge: string
  titre: string
  sousTitre: string
  image?: File | null              // nouvelle image
  supprimerImage?: boolean
}