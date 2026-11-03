import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Plus, Pencil, Trash2, CheckCircle2, Loader2, AlertCircle, RefreshCw, Sparkles,
  MapPin, Clock, Users, BookOpen, CalendarRange, Eye, EyeOff, ListChecks, Inbox, Infinity as InfinityIcon, Globe,
} from "lucide-react";

import { SessionFormationService } from "@/services/sessionFormation.service";
import type { EtatSession, FormationOption, SessionFormation, SessionFormationPayload } from "@/types/sessionFormation";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";

import DevisModal, { ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, inputClass, labelClass } from "@/components/common/Devismodal";
import PageSessionsModal from "@/components/sessions/PageSessionsModal";

/* =========================================================
   Aides
========================================================= */
const ETAT_CONFIG: Record<EtatSession, { label: string; bg: string; text: string; dot: string; pulse: boolean }> = {
  A_VENIR:  { label: "À venir",  bg: "bg-sky-50",     text: "text-sky-600",     dot: "bg-sky-500",     pulse: false },
  EN_COURS: { label: "En cours", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", pulse: true },
  TERMINEE: { label: "Terminée", bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400",    pulse: false },
};

/** "2026-11-03" → Date locale (sans décalage de fuseau) */
const versDate = (iso: string) => {
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(a, m - 1, j);
};

const dateLongue = (iso: string) =>
  versDate(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const periode = (debut: string, fin: string) =>
  debut === fin ? `Le ${dateLongue(debut)}` : `Du ${dateLongue(debut)} au ${dateLongue(fin)}`;

const moisAnnee = (iso: string) => {
  const t = versDate(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const nbJours = (debut: string, fin: string) =>
  Math.round((versDate(fin).getTime() - versDate(debut).getTime()) / 86400000) + 1;

const EtatBadge = ({ etat }: { etat: EtatSession }) => {
  const c = ETAT_CONFIG[etat];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${c.pulse ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
};

/* Interrupteur (même style que la page Utilisateurs) */
const StatusSwitch = ({ enabled, onClick, disabled, label }: { enabled: boolean; onClick: () => void; disabled?: boolean; label: string }) => (
  <button type="button" onClick={onClick} disabled={disabled} role="switch" aria-checked={enabled} aria-label={label} title={label}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00A4E0] flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
      enabled ? "bg-emerald-500" : "bg-gray-200"
    }`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

/* =========================================================
   Formulaire création / modification
   (monté seulement quand il est ouvert, avec une key par session :
    l'état est initialisé depuis les props, sans useEffect)
========================================================= */
interface FormProps {
  session: SessionFormation | null; // null = création
  formations: FormationOption[];
  onClose: () => void;
  onSaved: () => void;
}

const SessionFormModal = ({ session, formations, onClose, onSaved }: FormProps) => {
  const [formationId, setFormationId] = useState<string>(session ? String(session.formationId) : "");
  const [dateDebut, setDateDebut] = useState(session?.dateDebut ?? "");
  const [dateFin, setDateFin] = useState(session?.dateFin ?? "");
  const [lieu, setLieu] = useState(session?.lieu ?? "");
  const [horaires, setHoraires] = useState(session?.horaires ?? "");
  const [places, setPlaces] = useState(session?.nombrePlaces != null ? String(session.nombrePlaces) : "");
  const [active, setActive] = useState(session?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creation = session === null;

  /* La formation de la session peut avoir été désactivée : on la garde dans la liste */
  const options = useMemo(() => {
    if (!session || formations.some((f) => f.id === session.formationId)) return formations;
    return [{ id: session.formationId, libelle: `${session.formationLibelle} (désactivée)` }, ...formations];
  }, [formations, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formationId) return setError("Choisissez la formation.");
    if (!dateDebut || !dateFin) return setError("Les dates de début et de fin sont obligatoires.");
    if (dateFin < dateDebut) return setError("La date de fin doit être après la date de début.");
    const nb = places.trim() === "" ? null : Number(places);
    if (nb !== null && (!Number.isInteger(nb) || nb < 1)) return setError("Le nombre de places doit être un nombre entier (laissez vide pour illimité).");

    const payload: SessionFormationPayload = {
      formationId: Number(formationId),
      dateDebut,
      dateFin,
      lieu: lieu.trim() || null,
      horaires: horaires.trim() || null,
      nombrePlaces: nb,
      active,
    };

    try {
      setSaving(true);
      setError(null);
      if (session === null) await SessionFormationService.create(payload);
      else await SessionFormationService.update(session.id, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DevisModal
      titre={creation ? "Nouvelle session" : "Modifier la session"}
      sousTitre="Période pendant laquelle la formation est proposée"
      icon={CalendarDays}
      busy={saving}
      onClose={onClose}
      largeur="sm:max-w-2xl"
    >
      {(fermer) => (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <ModalBody>
            {/* Formation */}
            <div className="space-y-2">
              <label className={labelClass}><BookOpen size={14} className="text-[#00A4E0] flex-shrink-0" /> Formation continue <span className="text-red-500">*</span></label>
              <select value={formationId} onChange={(e) => setFormationId(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">— Choisir une formation —</option>
                {options.map((f) => <option key={f.id} value={f.id}>{f.libelle}</option>)}
              </select>
              {formations.length === 0 && (
                <p className="text-[11px] sm:text-xs text-amber-600">Aucune formation continue active : activez-en une dans « Formations continues → Formations ».</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}><CalendarDays size={14} className="text-[#00A4E0] flex-shrink-0" /> Date de début <span className="text-red-500">*</span></label>
                <input type="date" value={dateDebut}
                  onChange={(e) => {
                    setDateDebut(e.target.value);
                    if (!dateFin || dateFin < e.target.value) setDateFin(e.target.value);
                  }}
                  className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><CalendarRange size={14} className="text-[#00A4E0] flex-shrink-0" /> Date de fin <span className="text-red-500">*</span></label>
                <input type="date" value={dateFin} min={dateDebut || undefined} onChange={(e) => setDateFin(e.target.value)} className={inputClass} />
              </div>
            </div>
            {dateDebut && dateFin && dateFin >= dateDebut && (
              <p className="-mt-2 text-xs font-medium text-[#00A4E0]">
                {nbJours(dateDebut, dateFin)} jour{nbJours(dateDebut, dateFin) > 1 ? "s" : ""} — {periode(dateDebut, dateFin)}
              </p>
            )}

            {/* Lieu + horaires */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}><MapPin size={14} className="text-[#00A4E0] flex-shrink-0" /> Lieu</label>
                <input value={lieu} onChange={(e) => setLieu(e.target.value)} maxLength={150} placeholder="Campus ESIITECH, Libreville" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><Clock size={14} className="text-[#00A4E0] flex-shrink-0" /> Horaires</label>
                <input value={horaires} onChange={(e) => setHoraires(e.target.value)} maxLength={150} placeholder="8h30 – 12h30, du lundi au vendredi" className={inputClass} />
              </div>
            </div>

            {/* Places */}
            <div className="space-y-2">
              <label className={labelClass}>
                <Users size={14} className="text-[#00A4E0] flex-shrink-0" /> Nombre de places
                <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— vide = illimité</span>
              </label>
              <input type="number" min={1} step={1} inputMode="numeric" value={places} onChange={(e) => setPlaces(e.target.value)} placeholder="Illimité" className={`${inputClass} sm:max-w-[200px]`} />
              {session && session.inscrits > 0 && (
                <p className="text-[11px] sm:text-xs text-[#A6A6A6]">{session.inscrits} place{session.inscrits > 1 ? "s" : ""} déjà prise{session.inscrits > 1 ? "s" : ""} (en attente + confirmées).</p>
              )}
            </div>

            {/* Publication */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  {active ? <Eye size={15} className="text-emerald-600" /> : <EyeOff size={15} className="text-gray-400" />}
                  {active ? "Visible sur le site" : "Masquée sur le site"}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Les visiteurs peuvent s'inscrire jusqu'à la date de début.</p>
              </div>
              <StatusSwitch enabled={active} onClick={() => setActive((v) => !v)} label="Visible sur le site" />
            </div>

            <ErrorBox message={error} />
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={fermer} disabled={saving} className={`${btnCancel} flex-1`}>Annuler</button>
            <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</> : <><CheckCircle2 size={18} /> Enregistrer</>}
            </button>
          </ModalFooter>
        </form>
      )}
    </DevisModal>
  );
};

/* =========================================================
   Page
========================================================= */
type Filtre = EtatSession | "TOUTES";

const AgendaFormationPage = () => {
  const [sessions, setSessions] = useState<SessionFormation[]>([]);
  const [formations, setFormations] = useState<FormationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtre, setFiltre] = useState<Filtre>("A_VENIR");
  const [formationFiltre, setFormationFiltre] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SessionFormation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SessionFormation | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pageOpen, setPageOpen] = useState(false); // 🆕 image + textes de la page publique

  const charger = async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, f] = await Promise.all([SessionFormationService.list(), SessionFormationService.formations()]);
      setSessions(s);
      setFormations(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  /* Chargement initial : setState dans les callbacks de la promesse (autorisé) */
  useEffect(() => {
    let actif = true;
    Promise.all([SessionFormationService.list(), SessionFormationService.formations()])
      .then(([s, f]) => {
        if (!actif) return;
        setSessions(s);
        setFormations(f);
      })
      .catch((err) => {
        if (actif) setError(err instanceof Error ? err.message : "Erreur de chargement");
      })
      .finally(() => {
        if (actif) setLoading(false);
      });
    return () => {
      actif = false;
    };
  }, []);

  const compte = (e: EtatSession) => sessions.filter((s) => s.etat === e).length;

  /* Sessions filtrées, triées et groupées par mois */
  const groupes = useMemo(() => {
    const liste = sessions
      .filter((s) => filtre === "TOUTES" || s.etat === filtre)
      .filter((s) => !formationFiltre || String(s.formationId) === formationFiltre)
      .sort((a, b) =>
        filtre === "TERMINEE" ? b.dateDebut.localeCompare(a.dateDebut) : a.dateDebut.localeCompare(b.dateDebut)
      );

    const map = new Map<string, SessionFormation[]>();
    liste.forEach((s) => {
      const cle = moisAnnee(s.dateDebut);
      map.set(cle, [...(map.get(cle) ?? []), s]);
    });
    return [...map.entries()];
  }, [sessions, filtre, formationFiltre]);

  /* Formations présentes dans l'agenda (pour le filtre) */
  const formationsAgenda = useMemo(() => {
    const m = new Map<number, string>();
    sessions.forEach((s) => m.set(s.formationId, s.formationLibelle));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  const ouvrirForm = (s: SessionFormation | null) => {
    setEditing(s);
    setFormOpen(true);
  };

  const basculer = async (s: SessionFormation) => {
    try {
      setBusyId(s.id);
      const maj = await SessionFormationService.setActive(s.id, !s.active);
      setSessions((list) => list.map((x) => (x.id === maj.id ? maj : x)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const supprimer = async () => {
    if (!deleteTarget) return;
    try {
      setBusyId(deleteTarget.id);
      await SessionFormationService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await charger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const onglets: { key: Filtre; label: string; count: number }[] = [
    { key: "A_VENIR", label: "À venir", count: compte("A_VENIR") },
    { key: "EN_COURS", label: "En cours", count: compte("EN_COURS") },
    { key: "TERMINEE", label: "Terminées", count: compte("TERMINEE") },
    { key: "TOUTES", label: "Toutes", count: sessions.length },
  ];

  const totalInscrits = sessions.filter((s) => s.etat !== "TERMINEE").reduce((n, s) => n + s.inscrits, 0);

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
                <CalendarDays className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex items-center gap-3 sm:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0 sm:hidden">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="truncate">Agenda de formation</span>
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h1>
                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                  Périodes pendant lesquelles les formations continues sont proposées
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button type="button" onClick={charger} title="Rafraîchir" aria-label="Rafraîchir"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0] transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            {/* 🆕 Image et textes de la page publique */}
            <button type="button" onClick={() => setPageOpen(true)} title="Page du site public"
              className="min-h-[48px] px-4 flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-[#00A4E0] hover:text-[#00A4E0] transition-all">
              <Globe size={18} /> <span className="hidden sm:inline">Page du site</span>
            </button>
            <button type="button" onClick={() => ouvrirForm(null)}
              className="group relative flex-1 lg:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg
                         bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                         hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                         shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                         sm:hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden
                         flex items-center justify-center gap-2.5 sm:gap-3 min-h-[48px]">
              <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center sm:group-hover:scale-110 sm:group-hover:rotate-90 transition-all duration-300 flex-shrink-0">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="relative">Nouvelle session</span>
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-xl">
            <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-sky-700">{compte("A_VENIR")} à venir</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-green-700">{compte("EN_COURS")} en cours</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="w-2 h-2 bg-[#00A4E0] rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600">{totalInscrits} participant{totalInscrits > 1 ? "s" : ""} inscrit{totalInscrits > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Liste */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50">
        <div className="px-4 sm:px-8 py-3.5 sm:py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200 flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-lg font-black text-gray-900 flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-md flex-shrink-0">
              <ListChecks size={14} className="text-white" />
            </div>
            <span className="truncate">Sessions programmées</span>
          </h2>
        </div>

        <div className="p-3 sm:p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                {onglets.map((tab) => (
                  <button key={tab.key} type="button" onClick={() => setFiltre(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                      filtre === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab.label} <span className="tabular-nums text-gray-400">{tab.count}</span>
                  </button>
                ))}
              </div>

              <select value={formationFiltre} onChange={(e) => setFormationFiltre(e.target.value)}
                className="py-2 sm:py-1.5 px-3 w-full sm:w-64 border border-gray-200 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#00A4E0] focus:border-[#00A4E0]">
                <option value="">Toutes les formations</option>
                {formationsAgenda.map(([id, libelle]) => <option key={id} value={id}>{libelle}</option>)}
              </select>
            </div>

            {/* Chargement */}
            {loading && sessions.length === 0 && (
              <div className="p-10 sm:p-16 text-center">
                <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-lg font-semibold">Chargement de l'agenda...</span>
                </div>
              </div>
            )}

            {/* Vide */}
            {!loading && groupes.length === 0 && (
              <div className="p-10 sm:p-16 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Aucune session</h3>
                <p className="text-xs sm:text-sm text-gray-400 px-4">
                  {sessions.length === 0 ? "Créez une session pour proposer une formation sur le site." : "Aucune session ne correspond à ce filtre."}
                </p>
              </div>
            )}

            {/* Sessions groupées par mois */}
            {groupes.length > 0 && (
              <div className={`divide-y divide-gray-100 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                {groupes.map(([mois, liste]) => (
                  <div key={mois}>
                    <div className="px-4 sm:px-5 py-2 bg-gray-50/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <CalendarDays size={13} className="text-[#00A4E0]" /> {mois}
                      <span className="text-gray-400 normal-case font-medium">· {liste.length} session{liste.length > 1 ? "s" : ""}</span>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {liste.map((s) => {
                        const debut = versDate(s.dateDebut);
                        const remplissage = s.nombrePlaces ? Math.min(100, Math.round((s.inscrits / s.nombrePlaces) * 100)) : 0;
                        return (
                          <div key={s.id} className={`p-4 sm:px-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:bg-gray-50/70 transition-colors ${!s.active ? "opacity-60" : ""}`}>
                            {/* Date */}
                            <div className="flex items-center gap-3 md:w-auto">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] text-white flex flex-col items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-lg font-black leading-none">{debut.getDate()}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                  {debut.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
                                </span>
                              </div>
                              <div className="min-w-0 md:hidden flex-1">
                                <p className="font-bold text-gray-900 text-sm truncate">{s.formationLibelle}</p>
                                <EtatBadge etat={s.etat} />
                              </div>
                            </div>

                            {/* Infos */}
                            <div className="min-w-0 flex-1">
                              <div className="hidden md:flex items-center gap-2 min-w-0">
                                <p className="font-bold text-gray-900 truncate">{s.formationLibelle}</p>
                                <EtatBadge etat={s.etat} />
                                {!s.active && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[11px] font-semibold whitespace-nowrap">
                                    <EyeOff size={11} /> Masquée
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1"><CalendarRange size={12} className="text-[#00A4E0]" /> {periode(s.dateDebut, s.dateFin)}</span>
                                {s.lieu && <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-[#00A4E0]" /> {s.lieu}</span>}
                                {s.horaires && <span className="inline-flex items-center gap-1"><Clock size={12} className="text-[#00A4E0]" /> {s.horaires}</span>}
                              </div>
                            </div>

                            {/* Places */}
                            <div className="md:w-44 flex-shrink-0">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="inline-flex items-center gap-1 font-semibold text-gray-700"><Users size={12} className="text-[#00A4E0]" /> {s.inscrits} inscrit{s.inscrits > 1 ? "s" : ""}</span>
                                <span className="text-gray-400 inline-flex items-center gap-0.5">
                                  {s.nombrePlaces ? <>{s.placesRestantes} libre{(s.placesRestantes ?? 0) > 1 ? "s" : ""}</> : <><InfinityIcon size={12} /> illimité</>}
                                </span>
                              </div>
                              {s.nombrePlaces ? (
                                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div className={`h-full rounded-full ${remplissage >= 100 ? "bg-red-500" : remplissage >= 80 ? "bg-amber-500" : "bg-gradient-to-r from-[#00A4E0] to-[#0077A8]"}`}
                                    style={{ width: `${remplissage}%` }} />
                                </div>
                              ) : null}
                              <p className="text-[11px] text-emerald-600 font-medium mt-1">{s.confirmees} confirmée{s.confirmees > 1 ? "s" : ""}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between md:justify-end gap-1 flex-shrink-0">
                              <div className="flex items-center gap-2 mr-1" title={s.active ? "Visible sur le site" : "Masquée sur le site"}>
                                <StatusSwitch enabled={s.active} onClick={() => basculer(s)} disabled={busyId === s.id} label="Visible sur le site" />
                                <span className="text-[11px] text-gray-400 md:hidden">{s.active ? "Visible" : "Masquée"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Link to={`/sessions-formation/participations?session=${s.id}`} title="Voir les participants" aria-label="Voir les participants"
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors">
                                  <Users size={15} />
                                </Link>
                                <button type="button" onClick={() => ouvrirForm(s)} title="Modifier" aria-label="Modifier"
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors">
                                  <Pencil size={15} />
                                </button>
                                <button type="button" onClick={() => setDeleteTarget(s)} aria-label="Supprimer"
                                  disabled={s.inscrits > 0 || s.confirmees > 0}
                                  title={s.inscrits > 0 ? "Des personnes sont inscrites : masquez plutôt la session" : "Supprimer"}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                                  {busyId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              <span>{sessions.length} session{sessions.length > 1 ? "s" : ""} au total</span>
              <span className="hidden sm:inline">Les sessions visibles et à venir apparaissent sur le site</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire monté seulement quand il est ouvert (key = remise à zéro à chaque ouverture) */}
      {formOpen && (
        <SessionFormModal
          key={editing?.id ?? "nouvelle"}
          session={editing}
          formations={formations}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            charger();
          }}
        />
      )}

      {/* 🆕 Page publique : image d'arrière-plan + textes */}
      {pageOpen && (
        <PageSessionsModal
          onClose={() => setPageOpen(false)}
          onSaved={() => setPageOpen(false)}
        />
      )}

      <ConfirmActionModal
        open={deleteTarget !== null}
        loading={deleteTarget !== null && busyId === deleteTarget.id}
        title="Supprimer la session"
        message={deleteTarget ? `Supprimer la session « ${deleteTarget.formationLibelle} » (${periode(deleteTarget.dateDebut, deleteTarget.dateFin).toLowerCase()}) ?` : ""}
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

export default AgendaFormationPage;