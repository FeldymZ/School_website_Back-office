/* =========================
   ENUMS
========================= */

export type Civilite =
  | "M"
  | "MME"
  | "MLLE";

export type NiveauSouhaite =
  | "PREMIERE_ANNEE"
  | "DEUXIEME_ANNEE"
  | "TROISIEME_ANNEE";

export type StatutDiplome =
  | "OBTENU"
  | "EN_COURS";

export type StatutDemande =
  | "EN_ATTENTE"
  | "VALIDEE"
  | "REJETEE";

/* =========================
   REQUEST
========================= */

export type PreinscriptionRequest = {

  civilite: Civilite;

  nom: string;

  prenom: string;

  dateNaissance: string;

  lieuNaissance: string;

  nationalite: string;

  email: string;

  telephone: string;

  whatsapp?: string;

  niveauSouhaite: NiveauSouhaite;

  formationId: number;

  /* ================= DIPLOME ================= */

  diplomePresente: string;

  statutDiplome: StatutDiplome;

  anneeObtention?: number;

  etablissementProvenance: string;
};

/* =========================
   DEMANDE
========================= */

export interface PreinscriptionDemande {

  id: number;

  civilite: string;

  nom: string;

  prenom: string;

  /* ================= IDENTITE ================= */

  dateNaissance?: string;

  lieuNaissance?: string;

  nationalite: string;

  /* ================= CONTACT ================= */

  email: string;

  telephone: string;

  whatsapp?: string;

  /* ================= FORMATION ================= */

  niveau: string;

  formation: string;

  anneeUniversitaire: string;

  /* ================= STATUT ================= */

  statut: StatutDemande;

  createdAt: string;

  validatedAt?: string;

  pdfUrl?: string;

  /* ================= DIPLOME ================= */

  diplomePresente?: string;

  statutDiplome?: string;

  anneeObtention?: number;

  etablissementProvenance?: string;
}

/* =========================
   AUTRES
========================= */

export interface PreinscriptionEmetteur {

  id: number;

  nom: string;

  fonction: string;

  signatureUrl: string;

  actif: boolean;
}

export interface SessionUniversitaire {

  id: number;

  annee: string;
}

export interface PreinscriptionPeriode {

  id: number;

  dateDebut: string;

  dateFin: string;

  active: boolean;

  session: SessionUniversitaire;

  emetteur: PreinscriptionEmetteur;
}

/* =========================
   SESSION PUBLIQUE
========================= */

export interface SessionPublique {

  anneeUniversitaire: string | null;

  ouverte: boolean;

  dateDebut?: string;

  dateFin?: string;
}