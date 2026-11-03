import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Eye, Trash2, RefreshCw, Inbox, Loader2, Sparkles, ChevronLeft, ChevronRight, AlertCircle, Search,
  CheckCircle2, XCircle, ListChecks, UserRoundCheck, Download, User, Mail, Phone, MapPin, CalendarDays,
  Briefcase, BookOpen, Clock, CalendarRange, MessageSquareText,
} from "lucide-react";

import { InscriptionSessionService } from "@/services/sessionFormation.service";
import { dateCourte, initiales } from "@/utils/devis";
import type { InscriptionSession, InscriptionsStats, SessionFormation, StatutInscription } from "@/types/sessionFormation";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import DevisModal, { Bloc, ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, inputClass, labelClass } from "@/components/common/Devismodal";

const PAGE_SIZE = 10;
type Filtre = StatutInscription | "TOUS";

/* =========================================================
   Aides
========================================================= */
const STATUT_CONFIG: Record<StatutInscription, { label: string; bg: string; text: string; dot: string; pulse: boolean }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   pulse: true },
  CONFIRMEE:  { label: "Confirmée",  bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", pulse: false },
  REFUSEE:    { label: "Refusée",    bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     pulse: false },
};

/** "2026-11-03" → "3 nov. 2026" (sans décalage de fuseau) */
const jour = (iso?: string | null) => {
  if (!iso) return "—";
  const [a, m, j] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, j).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const age = (iso: string) => {
  const [a, m, j] = iso.split("-").map(Number);
  const now = new Date();
  let n = now.getFullYear() - a;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < j)) n--;
  return n;
};

const nomComplet = (i: InscriptionSession) => `${i.prenom} ${i.nom}`;
const libelleSession = (s: SessionFormation) => `${s.formationLibelle} — ${jour(s.dateDebut)}`;

const StatutBadge = ({ statut }: { statut: StatutInscription }) => {
  const c = STATUT_CONFIG[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${c.pulse ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
};

const Avatar = ({ i }: { i: InscriptionSession }) => (
  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
    i.sexe === "F" ? "bg-pink-50 text-pink-600" : "bg-sky-50 text-sky-600"
  }`}>
    {initiales(nomComplet(i))}
  </div>
);

const IconButton = ({ title, onClick, disabled, danger, children }: {
  title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) => (
  <button type="button" title={title} aria-label={title} disabled={disabled}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 transition-colors disabled:opacity-40 ${
      danger ? "hover:text-red-600 hover:bg-red-50" : "hover:text-[#00A4E0] hover:bg-[#00A4E0]/8"
    }`}>
    {children}
  </button>
);

/* Export CSV (s'ouvre directement dans Excel : séparateur « ; » + BOM UTF-8) */
const exporterCsv = (liste: InscriptionSession[], nomFichier: string) => {
  const entetes = [
    "Nom", "Prénom", "Sexe", "Date de naissance", "Lieu de naissance", "Email", "Téléphone",
    "Lieu de résidence", "En activité", "Profession", "Formation", "Début", "Fin", "Statut", "Inscrit le",
  ];
  const lignes = liste.map((i) => [
    i.nom, i.prenom, i.sexe === "F" ? "Femme" : "Homme", jour(i.dateNaissance), i.lieuNaissance, i.email, i.telephone,
    i.lieuResidence, i.enActivite ? "Oui" : "Non", i.profession ?? "", i.formationLibelle,
    jour(i.sessionDateDebut), jour(i.sessionDateFin), STATUT_CONFIG[i.statut].label, dateCourte(i.dateInscription),
  ]);
  const csv = [entetes, ...lignes]
    .map((l) => l.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
};

/* =========================================================
   Fenêtre « Refuser »
========================================================= */
const RefusModal = ({ inscription, onClose, onDone }: {
  inscription: InscriptionSession; onClose: () => void; onDone: (i: InscriptionSession) => void;
}) => {
  const [motif, setMotif] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      onDone(await InscriptionSessionService.refuser(inscription.id, motif.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refus impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DevisModal titre="Refuser la participation" sousTitre={nomComplet(inscription)} icon={XCircle}
      busy={saving} onClose={onClose} zIndex="z-[60]">
      {(fermer) => (
        <form onSubmit={envoyer} className="flex-1 flex flex-col min-h-0">
          <ModalBody>
            <p className="text-sm text-gray-600">
              Un mail sera envoyé à <strong>{inscription.email}</strong> pour l'informer que sa participation n'est pas retenue.
            </p>
            <div className="space-y-2">
              <label className={labelClass}>
                <MessageSquareText size={14} className="text-[#00A4E0] flex-shrink-0" /> Motif
                <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnel, affiché dans le mail</span>
              </label>
              <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={4} maxLength={1000}
                placeholder="Ex. : la session est complète, le profil ne correspond pas aux prérequis…"
                className={`${inputClass} resize-none`} />
            </div>
            <ErrorBox message={error} />
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={fermer} disabled={saving} className={`${btnCancel} flex-1`}>Annuler</button>
            <button type="submit" disabled={saving}
              className="min-h-[48px] flex-1 px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Envoi...</> : <><XCircle size={18} /> Refuser et prévenir</>}
            </button>
          </ModalFooter>
        </form>
      )}
    </DevisModal>
  );
};

/* =========================================================
   Fenêtre « Détail »
========================================================= */
const Ligne = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-1.5">
    <Icon size={15} className="text-[#00A4E0] mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="text-sm text-gray-800 break-words">{children}</div>
    </div>
  </div>
);

const DetailModal = ({ inscription, busy, onClose, onConfirmer, onRefuser }: {
  inscription: InscriptionSession; busy: boolean; onClose: () => void; onConfirmer: () => void; onRefuser: () => void;
}) => {
  const i = inscription;
  return (
    <DevisModal titre={nomComplet(i)} sousTitre={`Demande reçue le ${dateCourte(i.dateInscription)}`} icon={UserRoundCheck}
      busy={busy} onClose={onClose} largeur="sm:max-w-3xl" enTete={<span className="hidden sm:inline-flex"><StatutBadge statut={i.statut} /></span>}>
      {(fermer) => (
        <>
          <ModalBody>
            <Bloc titre="Session demandée" icon={BookOpen}>
              <p className="font-bold text-gray-900">{i.formationLibelle}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><CalendarRange size={12} className="text-[#00A4E0]" /> Du {jour(i.sessionDateDebut)} au {jour(i.sessionDateFin)}</span>
                {i.sessionLieu && <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-[#00A4E0]" /> {i.sessionLieu}</span>}
              </div>
            </Bloc>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Bloc titre="Identité" icon={User}>
                <Ligne icon={User} label="Nom et prénom">{i.nom} {i.prenom}</Ligne>
                <Ligne icon={User} label="Sexe">{i.sexe === "F" ? "Femme" : "Homme"}</Ligne>
                <Ligne icon={CalendarDays} label="Naissance">{jour(i.dateNaissance)} ({age(i.dateNaissance)} ans) à {i.lieuNaissance}</Ligne>
              </Bloc>
              <Bloc titre="Contact" icon={Mail}>
                <Ligne icon={Mail} label="Email"><a href={`mailto:${i.email}`} className="text-[#00A4E0] hover:underline">{i.email}</a></Ligne>
                <Ligne icon={Phone} label="Téléphone"><a href={`tel:${i.telephone}`} className="text-[#00A4E0] hover:underline">{i.telephone}</a></Ligne>
                <Ligne icon={MapPin} label="Lieu de résidence">{i.lieuResidence}</Ligne>
              </Bloc>
            </div>

            <Bloc titre="Situation" icon={Briefcase}>
              <Ligne icon={Briefcase} label="En activité">
                {i.enActivite ? <>Oui — <strong>{i.profession}</strong></> : "Non"}
              </Ligne>
            </Bloc>

            {i.statut !== "EN_ATTENTE" && (
              <Bloc titre="Traitement" icon={Clock}>
                <p className="text-sm text-gray-700">
                  {i.statut === "CONFIRMEE" ? "Confirmée" : "Refusée"} le {dateCourte(i.dateTraitement)}
                  {i.traitePar && <> par <strong>{i.traitePar}</strong></>}
                </p>
                {i.motifRefus && <p className="mt-2 text-sm text-red-600"><strong>Motif :</strong> {i.motifRefus}</p>}
              </Bloc>
            )}
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={fermer} disabled={busy} className={`${btnCancel} sm:flex-1`}>Fermer</button>
            {i.statut !== "REFUSEE" && (
              <button type="button" onClick={onRefuser} disabled={busy}
                className="min-h-[48px] sm:flex-1 px-6 py-3 rounded-xl border-2 border-red-200 font-semibold text-red-600 text-sm sm:text-base hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                <XCircle size={18} /> Refuser
              </button>
            )}
            {i.statut !== "CONFIRMEE" && (
              <button type="button" onClick={onConfirmer} disabled={busy} className={`${btnPrimary} sm:flex-1`}>
                {busy ? <><Loader2 size={18} className="animate-spin" /> Confirmation...</> : <><CheckCircle2 size={18} /> Confirmer</>}
              </button>
            )}
          </ModalFooter>
        </>
      )}
    </DevisModal>
  );
};

/* =========================================================
   PAGE
========================================================= */
const ParticipationsFormationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionParam = searchParams.get("session");
  const sessionId = sessionParam ? Number(sessionParam) : undefined;

  const [inscriptions, setInscriptions] = useState<InscriptionSession[]>([]);
  const [stats, setStats] = useState<InscriptionsStats | null>(null);
  const [sessions, setSessions] = useState<SessionFormation[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filtre, setFiltre] = useState<Filtre>("TOUS");
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [details, setDetails] = useState<InscriptionSession | null>(null);
  const [refus, setRefus] = useState<InscriptionSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InscriptionSession | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  /* Sessions (filtre) : une seule fois */
  useEffect(() => {
    let actif = true;
    InscriptionSessionService.sessions()
      .then((s) => { if (actif) setSessions(s); })
      .catch(() => { /* le filtre reste vide */ });
    return () => { actif = false; };
  }, []);

  /* Liste + stats (page, filtre, session ou rechargement) */
  useEffect(() => {
    let actif = true;
    Promise.all([
      InscriptionSessionService.list(page, PAGE_SIZE, filtre === "TOUS" ? undefined : filtre, sessionId),
      InscriptionSessionService.stats(),
    ])
      .then(([res, st]) => {
        if (!actif) return;
        setInscriptions(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setStats(st);
        setError(null);
      })
      .catch((err) => {
        if (actif) setError(err instanceof Error ? err.message : "Impossible de charger les demandes");
      })
      .finally(() => {
        if (actif) setLoading(false);
      });
    return () => { actif = false; };
  }, [page, filtre, sessionId, reloadKey]);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return inscriptions;
    return inscriptions.filter((i) =>
      [i.nom, i.prenom, i.email, i.telephone, i.formationLibelle, i.lieuResidence, i.profession]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [inscriptions, recherche]);

  const recharger = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const allerPage = (p: number) => {
    setLoading(true);
    setPage(p);
  };

  const changerFiltre = (f: Filtre) => {
    if (f === filtre) return;
    setLoading(true);
    setFiltre(f);
    setPage(0);
  };

  const changerSession = (v: string) => {
    setLoading(true);
    setPage(0);
    setSearchParams(v ? { session: v } : {});
  };

  /* Met à jour la ligne et la fenêtre de détail après une action */
  const remplacer = (maj: InscriptionSession) => {
    setDetails((d) => (d && d.id === maj.id ? maj : d));
    recharger();
  };

  const confirmer = async (i: InscriptionSession) => {
    try {
      setBusyId(i.id);
      remplacer(await InscriptionSessionService.confirmer(i.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Confirmation impossible");
    } finally {
      setBusyId(null);
    }
  };

  const supprimer = async () => {
    if (!deleteTarget) return;
    try {
      setBusyId(deleteTarget.id);
      await InscriptionSessionService.remove(deleteTarget.id);
      if (details?.id === deleteTarget.id) setDetails(null);
      setDeleteTarget(null);
      if (inscriptions.length === 1 && page > 0) allerPage(page - 1);
      else recharger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  /* Export : toute la session choisie, ou toutes les demandes du filtre */
  const exporter = async () => {
    try {
      setExporting(true);
      let liste: InscriptionSession[];
      if (sessionId) {
        liste = await InscriptionSessionService.parSession(sessionId);
        if (filtre !== "TOUS") liste = liste.filter((i) => i.statut === filtre);
      } else {
        liste = [];
        for (let p = 0; ; p++) {
          const res = await InscriptionSessionService.list(p, 100, filtre === "TOUS" ? undefined : filtre);
          liste.push(...res.content);
          if (p + 1 >= res.totalPages) break;
        }
      }
      if (liste.length === 0) return alert("Aucune demande à exporter");
      const s = sessions.find((x) => x.id === sessionId);
      const base = s ? `participants-${s.formationSlug}-${s.dateDebut}` : "demandes-participation";
      exporterCsv(liste, `${base}.csv`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export impossible");
    } finally {
      setExporting(false);
    }
  };

  const sessionChoisie = sessions.find((s) => s.id === sessionId);

  const onglets: { key: Filtre; label: string; count?: number }[] = [
    { key: "TOUS", label: "Toutes", count: stats?.total },
    { key: "EN_ATTENTE", label: "En attente", count: stats?.enAttente },
    { key: "CONFIRMEE", label: "Confirmées", count: stats?.confirmees },
    { key: "REFUSEE", label: "Refusées", count: stats?.refusees },
  ];

  const actions = (i: InscriptionSession, mobile = false) => {
    const base = `inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 ${mobile ? "min-h-[40px] px-3 flex-1" : "px-3 py-1.5"}`;
    return (
      <>
        {i.statut !== "CONFIRMEE" && (
          <button type="button" disabled={busyId === i.id} onClick={(e) => { e.stopPropagation(); confirmer(i); }}
            className={`${base} text-white bg-gradient-to-r from-[#00A4E0] to-[#0077A8] shadow-sm hover:shadow-md`}>
            {busyId === i.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Confirmer
          </button>
        )}
        {i.statut !== "REFUSEE" && (
          <button type="button" disabled={busyId === i.id} onClick={(e) => { e.stopPropagation(); setRefus(i); }}
            className={`${base} text-red-600 border border-red-200 hover:bg-red-50`}>
            <XCircle size={14} /> Refuser
          </button>
        )}
      </>
    );
  };

  /* ================= PREMIER CHARGEMENT ================= */
  if (loading && inscriptions.length === 0 && !error && stats === null) {
    return (
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <UserRoundCheck className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm sm:text-lg font-semibold">Chargement des demandes...</span>
            </div>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2.5 sm:mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
      {/* Header avec effet de glassmorphism */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/5 via-[#0088CC]/5 to-[#0077A8]/5" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className="relative group flex-shrink-0 hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <UserRoundCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex items-center gap-3 sm:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0 sm:hidden">
                <UserRoundCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="truncate">Demandes de participation</span>
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h1>
                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                  Inscriptions aux sessions de formation — confirmez ou refusez
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button type="button" onClick={recharger} title="Rafraîchir" aria-label="Rafraîchir"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0] transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button type="button" onClick={exporter} disabled={exporting}
              className="group relative flex-1 lg:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg
                         bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                         hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                         shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                         sm:hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden disabled:opacity-60
                         flex items-center justify-center gap-2.5 sm:gap-3 min-h-[48px]">
              <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                {exporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <span className="relative">Exporter (Excel)</span>
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-700">{stats?.enAttente ?? 0} en attente</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-green-700">{stats?.confirmees ?? 0} confirmée{(stats?.confirmees ?? 0) > 1 ? "s" : ""}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600">{stats?.refusees ?? 0} refusée{(stats?.refusees ?? 0) > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50">
        <div className="px-4 sm:px-8 py-3.5 sm:py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200 flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-lg font-black text-gray-900 flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-md flex-shrink-0">
              <ListChecks size={14} className="text-white" />
            </div>
            <span className="truncate">{sessionChoisie ? libelleSession(sessionChoisie) : "Liste des demandes"}</span>
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#A6A6A6] font-medium flex-shrink-0">
            <Eye size={14} className="text-[#00A4E0]" />
            Cliquez sur une ligne pour voir le détail
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                {onglets.map((tab) => (
                  <button key={tab.key} type="button" onClick={() => changerFiltre(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                      filtre === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab.label} <span className="tabular-nums text-gray-400">{tab.count ?? 0}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select value={sessionParam ?? ""} onChange={(e) => changerSession(e.target.value)}
                  className="py-2 sm:py-1.5 px-3 w-full sm:w-72 border border-gray-200 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-1 focus:ring-[#00A4E0] focus:border-[#00A4E0]">
                  <option value="">Toutes les sessions</option>
                  {sessions.map((s) => <option key={s.id} value={s.id}>{libelleSession(s)}</option>)}
                </select>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Rechercher sur cette page"
                    className="pl-8 pr-3 py-2 sm:py-1.5 w-full sm:w-56 border border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:ring-1 focus:ring-[#00A4E0] focus:border-[#00A4E0]" />
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="m-4 flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <span className="flex items-center gap-2 text-xs sm:text-sm text-red-700 font-medium"><AlertCircle size={16} /> {error}</span>
                <button type="button" onClick={recharger} className="text-xs sm:text-sm font-semibold text-red-700 underline">Réessayer</button>
              </div>
            )}

            {/* Vide */}
            {!loading && !error && inscriptions.length === 0 && (
              <div className="p-10 sm:p-16 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Aucune demande</h3>
                <p className="text-xs sm:text-sm text-gray-400 px-4">Les inscriptions faites sur le site apparaîtront ici.</p>
              </div>
            )}

            {inscriptions.length > 0 && (
              <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                {/* ===== TABLEAU — DESKTOP ===== */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Participant</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Session</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Téléphone</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Reçue le</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Statut</th>
                        <th className="text-right font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {visibles.map((i) => (
                        <tr key={i.id} onClick={() => setDetails(i)} className="cursor-pointer hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar i={i} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-gray-900 truncate max-w-[220px]">{nomComplet(i)}</span>
                                <span className="text-xs text-gray-400 truncate max-w-[220px]">{i.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 max-w-[260px]">
                            <p className="text-gray-700 truncate" title={i.formationLibelle}>{i.formationLibelle}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{jour(i.sessionDateDebut)} → {jour(i.sessionDateFin)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{i.telephone}</td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{dateCourte(i.dateInscription)}</td>
                          <td className="px-5 py-3.5"><StatutBadge statut={i.statut} /></td>
                          <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {actions(i)}
                              <IconButton title="Voir le détail" onClick={() => setDetails(i)}><Eye size={15} /></IconButton>
                              <IconButton title="Supprimer" danger onClick={() => setDeleteTarget(i)}><Trash2 size={15} /></IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {visibles.length === 0 && (
                    <div className="py-14 text-center text-sm text-gray-400">Aucun résultat pour « {recherche} »</div>
                  )}
                </div>

                {/* ===== CARTES — MOBILE ===== */}
                <div className="md:hidden divide-y divide-gray-50">
                  {visibles.map((i) => (
                    <div key={i.id} className="p-4 active:bg-gray-50" onClick={() => setDetails(i)}>
                      <div className="flex items-start gap-3">
                        <Avatar i={i} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 text-sm truncate">{nomComplet(i)}</span>
                            <StatutBadge statut={i.statut} />
                          </div>
                          <span className="text-xs text-gray-400 block truncate">{i.telephone} · {dateCourte(i.dateInscription)}</span>
                          <p className="text-sm text-gray-700 mt-2 truncate">{i.formationLibelle}</p>
                          <span className="text-xs text-gray-400">{jour(i.sessionDateDebut)} → {jour(i.sessionDateFin)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-3" onClick={(e) => e.stopPropagation()}>
                        {actions(i, true)}
                        <button type="button" onClick={() => setDeleteTarget(i)} aria-label="Supprimer"
                          className="min-h-[40px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 text-red-500 active:bg-red-50 active:scale-95 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {visibles.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-400 px-4">Aucun résultat pour « {recherche} »</div>
                  )}
                </div>
              </div>
            )}

            {/* Footer + pagination */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              <span>{totalElements} demande{totalElements > 1 ? "s" : ""}</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => allerPage(Math.max(0, page - 1))} disabled={page === 0 || loading}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-[#00A4E0] hover:border-[#00A4E0] disabled:opacity-40 transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  <span className="tabular-nums">Page {page + 1} / {totalPages}</span>
                  <button type="button" onClick={() => allerPage(page + 1)} disabled={page + 1 >= totalPages || loading}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-[#00A4E0] hover:border-[#00A4E0] disabled:opacity-40 transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fenêtres montées seulement quand elles sont ouvertes */}
      {details !== null && (
        <DetailModal
          key={details.id}
          inscription={details}
          busy={busyId === details.id}
          onClose={() => setDetails(null)}
          onConfirmer={() => confirmer(details)}
          onRefuser={() => setRefus(details)}
        />
      )}

      {refus !== null && (
        <RefusModal
          key={refus.id}
          inscription={refus}
          onClose={() => setRefus(null)}
          onDone={(maj) => {
            setRefus(null);
            remplacer(maj);
          }}
        />
      )}

      <ConfirmActionModal
        open={deleteTarget !== null}
        loading={deleteTarget !== null && busyId === deleteTarget.id}
        title="Supprimer la demande"
        message={`Supprimer définitivement la demande de ${deleteTarget ? nomComplet(deleteTarget) : ""} ? Aucun mail ne sera envoyé.`}
        confirmLabel="Supprimer"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 size={28} className="text-red-600" />}
        iconBg="bg-red-100"
        onConfirm={supprimer}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ParticipationsFormationPage;