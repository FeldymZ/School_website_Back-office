import { API_CONFIG } from "@/config/api";
import type { StatutDemandeDevis, TypeReduction } from "@/types/devis";

/** 460000 → "460.000 XAF" */
export const formatMontant = (n?: number | null) =>
  `${Math.round(n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} XAF`;

/** Calcul de la réduction — identique au calcul du serveur */
export const calculerReduction = (total: number, type: TypeReduction, valeur?: number | null) => {
  const v = valeur ?? 0;
  if (type === "TAUX") return Math.round((total * Math.min(Math.max(v, 0), 100)) / 100);
  if (type === "MONTANT") return Math.round(Math.min(Math.max(v, 0), total));
  return 0;
};

/** Couleurs des statuts (même style que les badges de rôle de la page Utilisateurs) */
export const STATUT_DEMANDE_CONFIG: Record<
  StatutDemandeDevis,
  { label: string; bg: string; text: string; border: string; dot: string; pulse: boolean }
> = {
  PAS_ENCORE_TRAITEE: { label: "Non traitée", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", pulse: true },
  EN_COURS:           { label: "En cours",    bg: "bg-sky-50",   text: "text-sky-600",   border: "border-sky-200",   dot: "bg-sky-500",   pulse: false },
  FERMEE:             { label: "Clôturée",    bg: "bg-gray-100", text: "text-gray-500",  border: "border-gray-200",  dot: "bg-gray-400",  pulse: false },
};

/** URL complète d'un fichier stocké (gère les chemins relatifs renvoyés par l'API) */
export const fileUrl = (url?: string | null) => {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_CONFIG.BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const formatDuree = (duree?: number | null, unite?: string | null) =>
  duree ? `${duree} ${(unite ?? "").toLowerCase().replace(/_/g, " ")}` : "—";

/** "Jean Paul MBA" → "JP" */
export const initiales = (nom?: string | null) =>
  (nom ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0])
    .join("")
    .toUpperCase() || "?";

/** Date courte : "23 oct. 2026" */
export const dateCourte = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";