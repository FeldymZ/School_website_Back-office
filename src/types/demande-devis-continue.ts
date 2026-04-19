import { StatutDemande } from "@/components/common/StatutBadge"
import { UniteDuree,  EnvoyePar } from "@/types/common"

/* ============================
   LIGNE DEMANDE
   ============================ */

export interface LigneDemande {

  formationLibelle: string
  prix: number
  duree: number
  uniteDuree: UniteDuree
  nombreParticipants: number

}

/* ============================
   DEMANDE DEVIS
   ============================ */

export interface DemandeDevisContinue { 

  id: number

  nomClient: string
  email: string
  telephone: string

  entreprise: boolean
  nomStructure: string | null

  dateDemande: string
  statut: StatutDemande
  dateTraitement: string | null

  lignes: LigneDemande[]

}

/* ============================
   REPONSE DEMANDE
   ============================ */

export interface DemandeDevisReponse {

  id: number

  message: string

  pieceJointeUrl: string | null

  envoyePar: EnvoyePar

  dateEnvoi: string

}