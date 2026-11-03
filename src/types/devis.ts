export type StatutDemandeDevis = "PAS_ENCORE_TRAITEE" | "EN_COURS" | "FERMEE";

/** AUCUNE = pas de réduction · TAUX = pourcentage · MONTANT = somme fixe en XAF */
export type TypeReduction = "AUCUNE" | "TAUX" | "MONTANT";

/* ================= DEMANDE ================= */

export interface DemandeDevisLigne {
  id: number;
  formationLibelle: string;
  nombreParticipants: number;
  prix?: number | null;
  duree?: number | null;
  uniteDuree?: string | null;
}

/* Réponse d'une demande : on réutilise le type déjà défini dans le projet,
   pour que les anciens composants (historique, réponse…) et le module devis
   partagent exactement le même type. */
import type { DemandeDevisReponse } from "@/types/demande-devis-continue";
export type { DemandeDevisReponse };

export interface DemandeDevisAdmin {
  id: number;
  nomClient: string;
  email: string;
  telephone: string;
  entreprise: boolean;
  nomStructure?: string | null;
  dateDemande: string;
  statut: StatutDemandeDevis;
  dateTraitement?: string | null;
  lignes: DemandeDevisLigne[];
  reponses: DemandeDevisReponse[];
  devis?: Devis | null;
}

/* ================= DEVIS ================= */

export interface DevisLigne {
  ligneDemandeId: number;
  libelle: string;
  duree?: number | null;
  uniteDuree?: string | null;
  nombreParticipants: number;
  prixUnitaire: number;
  montant: number;
}

export interface Devis {
  id: number;
  numero: string;
  dateEmission: string;
  dateValidite: string;

  /* Montants */
  montantTotal: number;
  typeReduction: TypeReduction;
  valeurReduction?: number | null;
  montantReduction: number;
  netAPayer: number;

  conditions?: string | null;
  generePar?: string | null;
  dateGeneration: string;
  dateEnvoi?: string | null;

  /* Validateur */
  emetteurId?: number | null;
  emetteurNom?: string | null;
  emetteurFonction?: string | null;

  lignes: DevisLigne[];
}

export interface GenererDevisRequest {
  emetteurId: number;
  validiteJours: number;
  typeReduction: TypeReduction;
  valeurReduction?: number | null;
  conditions?: string;
  lignes: { ligneId: number; nombreParticipants: number; prixUnitaire: number }[];
}

/* ================= VALIDATEUR (émetteur) ================= */

export interface DevisEmetteur {
  id: number;
  nom: string;
  fonction: string;
  signatureUrl: string;
  cachetUrl?: string | null;
  actif: boolean;
  nbDevis: number;
}

/* ================= AUTRES ================= */

export interface DemandesDevisStats {
  total: number;
  nonTraitees: number;
  enCours: number;
  fermees: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}