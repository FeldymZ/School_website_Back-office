import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Loader2, AlertCircle, Sparkles, RefreshCw,
  Lock, KeyRound, Link2, FolderTree, Type, Info, ShieldCheck, Users, Eye,
} from "lucide-react";

import { MenuModuleService } from "@/services/menuModule.service";
import { chargerModules } from "@/stores/menuModulesStore";
import { ICONES, iconeDe } from "@/config/menuDynamique";
import type { MenuModule, MenuModulePayload } from "@/types/menuModule";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import DevisModal, { ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, inputClass, labelClass } from "@/components/common/Devismodal";

/* Pages qui existent dans le code (App.tsx) : proposées dans le champ « Lien » */
const PAGES_EXISTANTES = [
  "/dashboard", "/formations", "/formations-continues", "/categories", "/sous-categories",
  "/demandes-devis", "/demandes-devis/validateurs", "/preinscriptions", "/preinscriptions/configuration",
  "/actualites", "/banner-messages", "/messages", "/contact", "/contact/unreplied", "/agenda",
  "/activites", "/banners", "/commentaires", "/statistiques", "/partenaires",
  "/utilisateurs", "/configuration", "/modules",
];

type ModeAcces = "CLE" | "TOUS" | "SUPERADMIN";

/* « Communication » + « Événements » → COMMUNICATION_EVENEMENTS */
const genererCle = (section: string, libelle: string) =>
  `${section}_${libelle}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

/* ================= INTERRUPTEUR (même style que la page Utilisateurs) ================= */
const StatusSwitch = ({ enabled, onClick, disabled, label }: { enabled: boolean; onClick: () => void; disabled?: boolean; label: string }) => (
  <button type="button" onClick={onClick} disabled={disabled} role="switch" aria-checked={enabled} aria-label={label} title={label}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00A4E0] flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
      enabled ? "bg-emerald-500" : "bg-gray-200"
    }`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

/* ================= ACCÈS (badge) ================= */
const AccesBadge = ({ m }: { m: MenuModule }) =>
  m.superAdminSeulement ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 whitespace-nowrap">
      <ShieldCheck size={12} /> SUPERADMIN
    </span>
  ) : m.cle ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-50 text-sky-600 font-mono break-all">
      <KeyRound size={12} className="flex-shrink-0" /> {m.cle}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 whitespace-nowrap">
      <Users size={12} /> Tous les ADMIN
    </span>
  );

/* =========================================================
   Formulaire ajout / modification
========================================================= */
interface FormProps {
  module: MenuModule | null; // null = création
  modules: MenuModule[];
  cles: string[];
  onClose: () => void;
  onSaved: () => void;
}

const ModuleFormModal = ({ module, modules, cles, onClose, onSaved }: FormProps) => {
  const creation = module === null;
  const verrouille = !!module?.systeme;

  const [libelle, setLibelle] = useState(module?.libelle ?? "");
  const [chemin, setChemin] = useState(module?.chemin ?? "");
  const [section, setSection] = useState(module?.section ?? "");
  const [groupe, setGroupe] = useState(module?.groupe ?? "");
  const [icone, setIcone] = useState<string>(module?.icone ?? "folder");
  const [actif, setActif] = useState(module?.actif ?? true);
  const [mode, setMode] = useState<ModeAcces>(
    module ? (module.superAdminSeulement ? "SUPERADMIN" : module.cle ? "CLE" : "TOUS") : "CLE"
  );
  /* "" = nouvelle clé générée à partir du nom ; sinon une clé existante */
  const [cleExistante, setCleExistante] = useState(module?.cle ?? "");
  const [nouvelleCle, setNouvelleCle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = useMemo(() => [...new Set(modules.map((m) => m.section))], [modules]);
  const groupes = useMemo(
    () => [...new Set(modules.filter((m) => m.section === section.trim() && m.groupe).map((m) => m.groupe!))],
    [modules, section]
  );

  /* Libellés lisibles des clés existantes (ex. « Devis · Validateurs des devis ») */
  const libellesCles = useMemo(() => {
    const map = new Map<string, string[]>();
    modules.forEach((m) => m.cle && map.set(m.cle, [...(map.get(m.cle) ?? []), m.libelle]));
    return map;
  }, [modules]);

  const cleAuto = genererCle(section || "MODULE", libelle || "NOUVEAU");
  const cleFinale = mode !== "CLE" ? null : cleExistante || (nouvelleCle.trim() ? nouvelleCle.trim().toUpperCase() : cleAuto);
  const pageInconnue = chemin.trim() !== "" && !PAGES_EXISTANTES.includes(chemin.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libelle.trim()) return setError("Le nom du lien est obligatoire.");
    if (!chemin.trim().startsWith("/")) return setError("Le lien doit commencer par / (ex. /actualites).");
    if (!section.trim()) return setError("La section est obligatoire.");

    const payload: MenuModulePayload = {
      libelle: libelle.trim(),
      chemin: chemin.trim().toLowerCase(),
      section: section.trim(),
      groupe: groupe.trim() || null,
      icone,
      actif,
      superAdminSeulement: mode === "SUPERADMIN",
      cle: cleFinale,
    };

    try {
      setSaving(true);
      setError(null);
      if (module === null) await MenuModuleService.creer(payload);
      else await MenuModuleService.modifier(module.id, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DevisModal
      titre={creation ? "Nouveau module" : "Modifier le module"}
      sousTitre={creation ? "Ajouter un lien au menu et sa case d'accès" : module?.chemin}
      icon={LayoutGrid}
      busy={saving}
      onClose={onClose}
      largeur="sm:max-w-2xl"
    >
      {(fermer) => (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <ModalBody>
            {verrouille && (
              <div className="flex items-start gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
                <Lock size={16} className="text-[#00A4E0] flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-600">
                  Module d'origine : le <strong>lien</strong> et l'<strong>accès</strong> sont verrouillés.
                  Vous pouvez changer le nom, la section, le sous-menu, l'icône, ou le masquer.
                </p>
              </div>
            )}

            {/* Nom + lien */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}><Type size={14} className="text-[#00A4E0] flex-shrink-0" /> Nom du lien <span className="text-red-500">*</span></label>
                <input value={libelle} onChange={(e) => setLibelle(e.target.value)} maxLength={80} placeholder="Ex : Événements" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}><Link2 size={14} className="text-[#00A4E0] flex-shrink-0" /> Page (lien) <span className="text-red-500">*</span></label>
                <input value={chemin} onChange={(e) => setChemin(e.target.value)} disabled={verrouille} list="modules-pages"
                  placeholder="/actualites" className={`${inputClass} font-mono`} />
                <datalist id="modules-pages">
                  {PAGES_EXISTANTES.map((p) => <option key={p} value={p} />)}
                </datalist>
                {pageInconnue && (
                  <p className="text-[11px] sm:text-xs text-amber-600 flex items-start gap-1">
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" /> Cette page n'existe pas encore dans le code : le lien mènera au tableau de bord.
                  </p>
                )}
              </div>
            </div>

            {/* Section + sous-menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}><FolderTree size={14} className="text-[#00A4E0] flex-shrink-0" /> Section <span className="text-red-500">*</span></label>
                <input value={section} onChange={(e) => setSection(e.target.value)} list="modules-sections" maxLength={60}
                  placeholder="Ex : Communication" className={inputClass} />
                <datalist id="modules-sections">{sections.map((s) => <option key={s} value={s} />)}</datalist>
                <p className="text-[11px] sm:text-xs text-[#A6A6A6]">Titre en petites majuscules dans le menu.</p>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>
                  <LayoutGrid size={14} className="text-[#00A4E0] flex-shrink-0" /> Sous-menu
                  <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnel</span>
                </label>
                <input value={groupe} onChange={(e) => setGroupe(e.target.value)} list="modules-groupes" maxLength={60}
                  placeholder="Vide = lien direct" className={inputClass} />
                <datalist id="modules-groupes">{groupes.map((g) => <option key={g} value={g} />)}</datalist>
                <p className="text-[11px] sm:text-xs text-[#A6A6A6]">Ex : « Formations continues » (dépliable).</p>
              </div>
            </div>

            {/* Icône */}
            <div className="space-y-2">
              <span className={labelClass}><Sparkles size={14} className="text-[#00A4E0] flex-shrink-0" /> Icône</span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Object.entries(ICONES).map(([nom, { icon: Icon, label }]) => (
                  <button key={nom} type="button" onClick={() => setIcone(nom)} title={label} aria-label={label} aria-pressed={icone === nom}
                    className={`h-11 rounded-xl border-2 flex items-center justify-center transition-all ${
                      icone === nom ? "border-[#00A4E0] bg-[#00A4E0]/10 text-[#00A4E0]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}>
                    <Icon size={18} />
                  </button>
                ))}
              </div>
              <p className="text-[11px] sm:text-xs text-[#A6A6A6]">Affichée pour un lien direct, ou pour le sous-menu (icône du 1er lien).</p>
            </div>

            {/* Accès */}
            <div className="space-y-2">
              <span className={labelClass}><KeyRound size={14} className="text-[#00A4E0] flex-shrink-0" /> Qui peut voir ce module ?</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  { v: "CLE", titre: "Avec une case d'accès", aide: "À cocher dans « Gérer les menus »" },
                  { v: "TOUS", titre: "Tous les ADMIN", aide: "Sans case à cocher" },
                  { v: "SUPERADMIN", titre: "SUPERADMIN seulement", aide: "Invisible pour les ADMIN" },
                ] as const).map((o) => (
                  <button key={o.v} type="button" disabled={verrouille} onClick={() => setMode(o.v)}
                    className={`text-left p-3 rounded-xl border-2 transition-all disabled:cursor-not-allowed ${
                      mode === o.v ? "border-[#00A4E0] bg-[#00A4E0]/5" : "border-gray-200 hover:border-gray-300"
                    } ${verrouille && mode !== o.v ? "opacity-40" : ""}`}>
                    <p className="text-sm font-semibold text-gray-900">{o.titre}</p>
                    <p className="text-[11px] text-gray-500">{o.aide}</p>
                  </button>
                ))}
              </div>

              {mode === "CLE" && !verrouille && (
                <div className="p-3.5 sm:p-4 bg-gray-50/60 border border-gray-200 rounded-xl space-y-3">
                  <select value={cleExistante} onChange={(e) => setCleExistante(e.target.value)} className={`${inputClass} bg-white`}>
                    <option value="">➕ Nouvelle case d'accès</option>
                    {cles.map((c) => (
                      <option key={c} value={c}>
                        Même accès que : {libellesCles.get(c)?.join(" · ") ?? c}
                      </option>
                    ))}
                  </select>
                  {cleExistante === "" && (
                    <input value={nouvelleCle} onChange={(e) => setNouvelleCle(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                      maxLength={60} placeholder={cleAuto} className={`${inputClass} bg-white font-mono`} />
                  )}
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    Clé utilisée : <span className="font-mono font-semibold text-gray-700">{cleFinale}</span>
                    {cleExistante && " — les ADMIN qui ont déjà cet accès verront aussi ce lien."}
                  </p>
                </div>
              )}
              {verrouille && module?.cle && (
                <p className="text-[11px] sm:text-xs text-gray-500">Clé : <span className="font-mono font-semibold text-gray-700">{module.cle}</span></p>
              )}
            </div>

            {/* Afficher */}
            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 border border-gray-200 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900">Afficher dans le menu</p>
                <p className="text-[11px] sm:text-xs text-gray-500">Désactivé = le module est masqué (rien n'est supprimé).</p>
              </div>
              <StatusSwitch enabled={actif} onClick={() => setActif((a) => !a)} disabled={module?.chemin === "/modules"} label="Afficher dans le menu" />
            </div>

            <ErrorBox message={error} />
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={fermer} disabled={saving} className={`${btnCancel} flex-1`}>Annuler</button>
            <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</> : <><Plus size={18} /> {creation ? "Ajouter le module" : "Enregistrer"}</>}
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
const ModulesPage = () => {
  const [modules, setModules] = useState<MenuModule[]>([]);
  const [cles, setCles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuModule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuModule | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  /* Chargement : setState dans les callbacks de la promesse */
  useEffect(() => {
    let actif = true;
    Promise.all([MenuModuleService.tous(), MenuModuleService.cles()])
      .then(([liste, toutesCles]) => {
        if (!actif) return;
        setModules(liste);
        setCles([...toutesCles].sort());
        setError(null);
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
  }, [reloadKey]);

  /* Recharge la page + le menu de gauche */
  const recharger = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
    chargerModules(true);
  };

  /* Sections dans l'ordre du menu */
  const sections = useMemo(() => {
    const tries = [...modules].sort((a, b) => a.ordre - b.ordre || a.id - b.id);
    const map = new Map<string, MenuModule[]>();
    tries.forEach((m) => map.set(m.section, [...(map.get(m.section) ?? []), m]));
    return [...map.entries()];
  }, [modules]);

  const nbActifs = modules.filter((m) => m.actif).length;

  const action = async (id: number, fn: () => Promise<unknown>) => {
    try {
      setBusyId(id);
      await fn();
      recharger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const deplacer = (liste: MenuModule[], index: number, sens: -1 | 1) => {
    const cible = index + sens;
    if (cible < 0 || cible >= liste.length) return;
    const ids = liste.map((m) => m.id);
    [ids[index], ids[cible]] = [ids[cible], ids[index]];
    action(liste[index].id, () => MenuModuleService.reordonner(ids));
  };

  const supprimer = async () => {
    if (!deleteTarget) return;
    const cible = deleteTarget;
    await action(cible.id, () => MenuModuleService.supprimer(cible.id));
    setDeleteTarget(null);
  };

  const ouvrirForm = (m: MenuModule | null) => {
    setEditing(m);
    setFormOpen(true);
  };

  /* ================= PREMIER CHARGEMENT ================= */
  if (loading && modules.length === 0 && !error) {
    return (
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10 inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm sm:text-lg font-semibold">Chargement des modules...</span>
          </div>
        </div>
      </div>
    );
  }

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
                <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex items-center gap-3 sm:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0 sm:hidden">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="truncate">Modules</span>
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h1>
                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                  Liens du menu et cases d'accès des ADMIN
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button type="button" onClick={recharger} title="Rafraîchir" aria-label="Rafraîchir"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0] transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
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
              <span className="relative">Nouveau module</span>
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-green-700">{nbActifs} affiché{nbActifs > 1 ? "s" : ""}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600">{modules.length - nbActifs} masqué{modules.length - nbActifs > 1 ? "s" : ""}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-xl">
            <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-sky-700">{cles.length} case{cles.length > 1 ? "s" : ""} d'accès</span>
          </div>
        </div>
      </div>

      {/* Aide */}
      <div className="flex items-start gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
        <Info size={18} className="text-[#00A4E0] flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-gray-600">
          Un module = <strong>un lien dans le menu</strong> vers une page du back office, et <strong>une case d'accès</strong> dans
          « Gérer les menus ». Les modules d'origine (<Lock size={11} className="inline" />) peuvent être renommés, déplacés ou masqués, mais pas supprimés.
        </p>
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-red-700 font-medium flex items-center gap-2"><AlertCircle size={16} /> {error}</p>
          <button type="button" onClick={recharger} className="text-xs sm:text-sm font-semibold text-red-700 underline">Réessayer</button>
        </div>
      )}

      {/* Une carte par section */}
      {sections.map(([section, liste]) => (
        <div key={section} className={`relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div className="px-4 sm:px-8 py-3.5 sm:py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200 flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-lg font-black text-gray-900 flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-md flex-shrink-0">
                <FolderTree size={14} className="text-white" />
              </div>
              <span className="truncate">{section}</span>
            </h2>
            <span className="text-xs text-[#A6A6A6] font-medium flex-shrink-0">{liste.length} lien{liste.length > 1 ? "s" : ""}</span>
          </div>

          <div className="p-3 sm:p-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-50">
              {liste.map((m, i) => {
                const Icon = iconeDe(m.icone);
                const occupe = busyId === m.id;
                return (
                  <div key={m.id} className={`flex flex-col md:flex-row md:items-center gap-3 px-4 sm:px-5 py-3.5 ${m.actif ? "" : "bg-gray-50/70"}`}>
                    {/* Lien */}
                    <div className="flex items-center gap-3 min-w-0 md:w-[34%]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.actif ? "bg-sky-50 text-sky-600" : "bg-gray-100 text-gray-400"}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium truncate flex items-center gap-1.5 ${m.actif ? "text-gray-900" : "text-gray-400 line-through"}`}>
                          {m.libelle}
                          {m.systeme && <Lock size={12} className="text-gray-300 flex-shrink-0" aria-label="Module d'origine" />}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {m.groupe ? <>Sous-menu « {m.groupe} »</> : "Lien direct"}
                        </p>
                      </div>
                    </div>

                    {/* Page + accès */}
                    <div className="flex flex-wrap items-center gap-2 md:flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                        <Link2 size={11} /> {m.chemin}
                      </span>
                      <AccesBadge m={m} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-2 mr-2">
                        <Eye size={14} className={m.actif ? "text-emerald-500" : "text-gray-300"} />
                        <StatusSwitch enabled={m.actif} disabled={occupe || m.chemin === "/modules"}
                          label={m.actif ? "Masquer du menu" : "Afficher dans le menu"}
                          onClick={() => action(m.id, () => MenuModuleService.changerActif(m.id, !m.actif))} />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button type="button" onClick={() => deplacer(liste, i, -1)} disabled={i === 0 || occupe} title="Monter" aria-label="Monter"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                          <ArrowUp size={15} />
                        </button>
                        <button type="button" onClick={() => deplacer(liste, i, 1)} disabled={i === liste.length - 1 || occupe} title="Descendre" aria-label="Descendre"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                          <ArrowDown size={15} />
                        </button>
                        <button type="button" onClick={() => ouvrirForm(m)} title="Modifier" aria-label="Modifier"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors">
                          {occupe ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(m)} disabled={m.systeme} aria-label="Supprimer"
                          title={m.systeme ? "Module d'origine : masquez-le plutôt" : "Supprimer"}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Formulaire monté seulement quand il est ouvert (key = remise à zéro à chaque ouverture) */}
      {formOpen && (
        <ModuleFormModal
          key={editing?.id ?? "nouveau"}
          module={editing}
          modules={modules}
          cles={cles}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            recharger();
          }}
        />
      )}

      <ConfirmActionModal
        open={deleteTarget !== null}
        loading={deleteTarget !== null && busyId === deleteTarget.id}
        title="Supprimer le module"
        message={`Supprimer « ${deleteTarget?.libelle ?? ""} » du menu ? Si sa case d'accès n'est utilisée par aucun autre module, elle sera aussi retirée des ADMIN.`}
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

export default ModulesPage;