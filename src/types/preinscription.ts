export type StatutDemande = "EN_ATTENTE" | "VALIDEE" | "REJETEE";

/* ================= DEMANDE ================= */
export interface PreinscriptionDemande {
  id: number;
  civilite: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  whatsapp?: string;
  niveau: string;
  formation: string;
  nationalite: string;
  anneeUniversitaire: string;
  statut: StatutDemande;
  createdAt: string;
  validatedAt?: string;
  pdfUrl?: string;
}

/* ================= EMETTEUR ================= */
export interface PreinscriptionEmetteur {
  id: number;
  nom: string;
  fonction: string;
  signatureUrl: string;
  actif: boolean;
}

/* ================= SESSION ================= */
export interface SessionUniversitaire {
  id: number;
  annee: string;
}

/* ================= PERIODE ================= */
/* 🔥 CORRECTION ICI */
export interface PreinscriptionPeriode {
  id: number;

  dateDebut: string;
  dateFin: string;
     active: boolean;
  session: SessionUniversitaire;
  emetteur: PreinscriptionEmetteur;
}

/* ================= PUBLIC ================= */
export interface SessionPublique {
  anneeUniversitaire: string | null;
  ouverte: boolean;
  dateDebut?: string;
  dateFin?: string;
}