import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye, FileSignature, FileText, Trash2, RefreshCw, Inbox, Loader2, ClipboardList, Sparkles,
  ChevronLeft, ChevronRight, AlertCircle, Building2, Search, UserCheck, Send, CheckCircle2, Clock, ListChecks,
} from "lucide-react";

import { DemandeDevisService, saveBlob } from "@/services/DemandeDevisContinuesService";
import { STATUT_DEMANDE_CONFIG, dateCourte, formatMontant, initiales } from "@/utils/devis";
import type { DemandeDevisAdmin, DemandesDevisStats, StatutDemandeDevis } from "@/types/devis";

import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import GenererDevisModal from "@/components/devis/GenererDevisModal";
import DemandeDevisDetailsModal from "@/components/devis/DemandeDevisDetailsModal";

const PAGE_SIZE = 10;
type Filtre = StatutDemandeDevis | "TOUS";

const nomAffiche = (d: DemandeDevisAdmin) => (d.entreprise && d.nomStructure ? d.nomStructure : d.nomClient);

/* ================= BADGE STATUT ================= */
const StatutBadge = ({ statut }: { statut: StatutDemandeDevis }) => {
  const c = STATUT_DEMANDE_CONFIG[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${c.pulse ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
};

/* ================= AVATAR (initiales) ================= */
const Avatar = ({ d }: { d: DemandeDevisAdmin }) => (
  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
    d.entreprise ? "bg-indigo-50 text-indigo-600" : "bg-sky-50 text-sky-600"
  }`}>
    {initiales(nomAffiche(d))}
  </div>
);

/* ================= BOUTON ICÔNE ================= */
const IconButton = ({ title, onClick, disabled, danger, children }: {
  title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 transition-colors disabled:opacity-40 ${
      danger ? "hover:text-red-600 hover:bg-red-50" : "hover:text-[#00A4E0] hover:bg-[#00A4E0]/8"
    }`}
  >
    {children}
  </button>
);

/* =========================================================
   PAGE
========================================================= */
const DemandesDevisAdminPage = () => {
  const [demandes, setDemandes] = useState<DemandeDevisAdmin[]>([]);
  const [stats, setStats] = useState<DemandesDevisStats | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filtre, setFiltre] = useState<Filtre>("TOUS");
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [devisDemande, setDevisDemande] = useState<DemandeDevisAdmin | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  /* ── Chargement (page, filtre ou rechargement demandé).
        Les setState sont faits dans les callbacks de la promesse (autorisé). ── */
  useEffect(() => {
    let actif = true;
    Promise.all([
      DemandeDevisService.list(page, PAGE_SIZE, filtre === "TOUS" ? undefined : filtre),
      DemandeDevisService.stats(),
    ])
      .then(([res, st]) => {
        if (!actif) return;
        setDemandes(res.content);
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
    return () => {
      actif = false;
    };
  }, [page, filtre, reloadKey]);

  /* Recherche sur la page affichée (nom, structure, email, formation, n° de devis) */
  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return demandes;
    return demandes.filter((d) =>
      [d.nomClient, d.nomStructure, d.email, d.devis?.numero, ...d.lignes.map((l) => l.formationLibelle)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [demandes, recherche]);

  const recharger = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const allerPage = (p: number) => {
    setLoading(true);
    setPage(p);
  };

  const handleChanged = () => {
    recharger();
    setRefreshKey((k) => k + 1);
  };

  const changerFiltre = (f: Filtre) => {
    if (f === filtre) return;
    setLoading(true);
    setFiltre(f);
    setPage(0);
  };

  /* ── Actions ── */
  const telechargerDevis = async (d: DemandeDevisAdmin) => {
    if (!d.devis) return;
    try {
      setDownloadingId(d.id);
      saveBlob(await DemandeDevisService.telechargerDevis(d.id), `${d.devis.numero}.pdf`);
    } catch {
      alert("Impossible de télécharger le devis");
    } finally {
      setDownloadingId(null);
    }
  };

  const supprimer = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await DemandeDevisService.supprimer(deleteId);
      setDeleteId(null);
      if (detailsId === deleteId) setDetailsId(null);
      if (demandes.length === 1 && page > 0) allerPage(page - 1);
      else recharger();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  /* Bouton principal : ce qu'il reste à faire pour la demande */
  const actionPrincipale = (d: DemandeDevisAdmin, mobile = false) => {
    if (d.statut === "FERMEE") return null;
    const label = !d.devis ? "Valider le devis" : d.devis.dateEnvoi ? "Revalider" : "Envoyer";
    const Icon = !d.devis ? FileSignature : d.devis.dateEnvoi ? RefreshCw : Send;
    const plein = !d.devis || !d.devis.dateEnvoi;
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setDevisDemande(d); }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
          mobile ? "min-h-[40px] px-3" : "px-3 py-1.5"
        } ${
          plein
            ? "text-white bg-gradient-to-r from-[#00A4E0] to-[#0077A8] shadow-sm hover:shadow-md"
            : "text-[#00A4E0] border border-[#00A4E0]/40 hover:bg-[#00A4E0]/8"
        }`}
      >
        <Icon size={14} /> {label}
      </button>
    );
  };

  const celluleDevis = (d: DemandeDevisAdmin) =>
    d.devis ? (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{d.devis.numero}</span>
        <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">{formatMontant(d.devis.netAPayer)}</span>
        {d.devis.dateEnvoi ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600"><CheckCircle2 size={11} /> Envoyé</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600"><Clock size={11} /> Non envoyé</span>
        )}
      </div>
    ) : (
      <span className="text-xs text-gray-400">Aucun devis</span>
    );

  const onglets: { key: Filtre; label: string; count?: number }[] = [
    { key: "TOUS", label: "Toutes", count: stats?.total },
    { key: "PAS_ENCORE_TRAITEE", label: "Non traitées", count: stats?.nonTraitees },
    { key: "EN_COURS", label: "En cours", count: stats?.enCours },
    { key: "FERMEE", label: "Clôturées", count: stats?.fermees },
  ];

  /* ================= PREMIER CHARGEMENT ================= */
  if (loading && demandes.length === 0 && !error && stats === null) {
    return (
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipboardList className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
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
            {/* Icône avec effet de glow */}
            <div className="relative group flex-shrink-0 hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex items-center gap-3 sm:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0 sm:hidden">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="truncate">Demandes de devis</span>
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h1>
                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                  Formations continues — validez le devis puis envoyez-le au client
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button type="button" onClick={recharger} title="Rafraîchir" aria-label="Rafraîchir"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0] transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <Link to="/demandes-devis/validateurs"
              className="group relative flex-1 lg:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg
                         bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                         hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                         shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                         sm:hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden
                         flex items-center justify-center gap-2.5 sm:gap-3 min-h-[48px]">
              <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="relative">Validateurs</span>
            </Link>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-700">{stats?.nonTraitees ?? 0} non traitée{(stats?.nonTraitees ?? 0) > 1 ? "s" : ""}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-xl">
            <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-sky-700">{stats?.enCours ?? 0} en cours</span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600">{stats?.fermees ?? 0} clôturée{(stats?.fermees ?? 0) > 1 ? "s" : ""}</span>
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
            <span className="truncate">Liste des demandes</span>
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#A6A6A6] font-medium flex-shrink-0">
            <Eye size={14} className="text-[#00A4E0]" />
            Cliquez sur une ligne pour voir le détail
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-gray-100">
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

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher sur cette page"
                  className="pl-8 pr-3 py-2 sm:py-1.5 w-full sm:w-56 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-1 focus:ring-[#00A4E0] focus:border-[#00A4E0]"
                />
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
            {!loading && !error && demandes.length === 0 && (
              <div className="p-10 sm:p-16 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Aucune demande</h3>
                <p className="text-xs sm:text-sm text-gray-400 px-4">Les demandes de devis apparaîtront ici.</p>
              </div>
            )}

            {demandes.length > 0 && (
              <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                {/* ===== TABLEAU — DESKTOP (md et plus) ===== */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Client</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Formations</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Reçue le</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Devis</th>
                        <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Statut</th>
                        <th className="text-right font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {visibles.map((d) => (
                        <tr key={d.id} onClick={() => setDetailsId(d.id)} className="cursor-pointer hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar d={d} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-gray-900 truncate max-w-[220px] flex items-center gap-1.5">
                                  {d.entreprise && <Building2 size={13} className="text-gray-400 flex-shrink-0" />}
                                  {nomAffiche(d)}
                                </span>
                                <span className="text-xs text-gray-400 truncate max-w-[220px]">{d.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 max-w-[240px]">
                            <p className="text-gray-700 truncate" title={d.lignes.map((l) => l.formationLibelle).join(", ")}>
                              {d.lignes[0]?.formationLibelle ?? "—"}
                            </p>
                            {d.lignes.length > 1 && (
                              <span className="text-xs font-medium text-[#00A4E0]">+ {d.lignes.length - 1} autre{d.lignes.length > 2 ? "s" : ""}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{dateCourte(d.dateDemande)}</td>
                          <td className="px-5 py-3.5">{celluleDevis(d)}</td>
                          <td className="px-5 py-3.5"><StatutBadge statut={d.statut} /></td>
                          <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {actionPrincipale(d)}
                              <IconButton title="Voir le détail" onClick={() => setDetailsId(d.id)}><Eye size={15} /></IconButton>
                              {d.devis && (
                                <IconButton title={`Télécharger ${d.devis.numero}`} onClick={() => telechargerDevis(d)} disabled={downloadingId === d.id}>
                                  {downloadingId === d.id ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                                </IconButton>
                              )}
                              <IconButton title="Supprimer" danger onClick={() => setDeleteId(d.id)}><Trash2 size={15} /></IconButton>
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

                {/* ===== CARTES — MOBILE (moins de md) ===== */}
                <div className="md:hidden divide-y divide-gray-50">
                  {visibles.map((d) => (
                    <div key={d.id} className="p-4 active:bg-gray-50" onClick={() => setDetailsId(d.id)}>
                      <div className="flex items-start gap-3">
                        <Avatar d={d} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 text-sm truncate">{nomAffiche(d)}</span>
                            <StatutBadge statut={d.statut} />
                          </div>
                          <span className="text-xs text-gray-400 block">{dateCourte(d.dateDemande)}</span>
                          <p className="text-sm text-gray-700 mt-2">
                            {d.lignes[0]?.formationLibelle ?? "—"}
                            {d.lignes.length > 1 && <span className="text-xs font-medium text-[#00A4E0]"> + {d.lignes.length - 1}</span>}
                          </p>
                          <div className="mt-2">{celluleDevis(d)}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mt-3" onClick={(e) => e.stopPropagation()}>
                        {actionPrincipale(d, true) ?? (
                          <button type="button" onClick={() => setDetailsId(d.id)}
                            className="min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-gray-600 active:bg-gray-100 active:scale-95 transition-all">
                            <Eye size={14} /><span className="text-xs font-medium">Détail</span>
                          </button>
                        )}
                        <div className="flex gap-1.5">
                          {d.devis && (
                            <button type="button" onClick={() => telechargerDevis(d)} disabled={downloadingId === d.id}
                              className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-gray-600 active:bg-gray-100 active:scale-95 transition-all disabled:opacity-50">
                              {downloadingId === d.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                              <span className="text-xs font-medium">PDF</span>
                            </button>
                          )}
                          <button type="button" onClick={() => setDeleteId(d.id)} aria-label="Supprimer"
                            className="flex-1 min-h-[40px] flex items-center justify-center rounded-lg border border-gray-200 text-red-500 active:bg-red-50 active:scale-95 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {/* Modales montées seulement quand elles sont ouvertes (key = remise à zéro à chaque ouverture) */}
      {detailsId !== null && (
        <DemandeDevisDetailsModal
          key={detailsId}
          demandeId={detailsId}
          refreshKey={refreshKey}
          onClose={() => setDetailsId(null)}
          onChanged={handleChanged}
          onGenererDevis={(d) => setDevisDemande(d)}
        />
      )}

      {devisDemande !== null && (
        <GenererDevisModal
          key={devisDemande.id}
          demande={devisDemande}
          onClose={() => setDevisDemande(null)}
          onChanged={handleChanged}
        />
      )}

      <ConfirmActionModal
        open={deleteId !== null}
        loading={deleting}
        title="Supprimer la demande"
        message="La demande, son devis et tout l'historique des échanges seront définitivement supprimés."
        confirmLabel="Supprimer"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 size={28} className="text-red-600" />}
        iconBg="bg-red-100"
        onConfirm={supprimer}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DemandesDevisAdminPage;