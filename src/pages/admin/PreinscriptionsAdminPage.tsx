import { useEffect, useState, useMemo } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Search,
  InboxIcon,
  Sparkles,
  ClipboardList,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  Users,
} from "lucide-react";

import { PreinscriptionService } from "@/services/preinscription.service";
import { PreinscriptionDemande, StatutDemande } from "@/types/preinscription";

import PreinscriptionDetailsModal from "@/components/preinscriptions/PreinscriptionDetailsModal";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import { API_CONFIG } from "@/config/api";
import { formatDate } from "@/utils/date";

/* ── Statut config ── */
const STATUT_CONFIG = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400",  pulse: true  },
  VALIDEE:    { label: "Validée",    bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-400",  pulse: false },
  REJETEE:    { label: "Rejetée",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-400",    pulse: false },
};

const StatutBadge = ({ statut }: { statut: StatutDemande }) => {
  const cfg = STATUT_CONFIG[statut];
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
      ${cfg.bg} ${cfg.text} border ${cfg.border} text-xs font-semibold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) => (
  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
    <div className={`absolute -right-4 -top-4 w-20 h-20 ${color} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon size={18} className="text-gray-700" />
      </div>
    </div>
  </div>
);

/* ── Page ── */
const PreinscriptionsAdminPage = () => {
  const [demandes,      setDemandes]      = useState<PreinscriptionDemande[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterStatut,  setFilterStatut]  = useState<StatutDemande | "TOUS">("TOUS");
  const [selectedId,    setSelectedId]    = useState<number | null>(null);
  const [openDetails,   setOpenDetails]   = useState(false);
  const [openValidate,  setOpenValidate]  = useState(false);
  const [openReject,    setOpenReject]    = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* ✅ Download PDF — via API_CONFIG */
  const downloadPdfSecure = async (
    demandeId: number,
    nom:       string,
    prenom:    string
  ) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.PREINSCRIPTIONS.PDF(demandeId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Erreur téléchargement");

      const blob    = await res.blob();
      const fileURL = URL.createObjectURL(blob);
      const link    = document.createElement("a");
      link.href     = fileURL;
      link.download = `preinscription_${nom}_${prenom}.pdf`;
      link.click();
      URL.revokeObjectURL(fileURL);

    } catch (err) {
      console.error(err);
      alert("Impossible de télécharger le PDF");
    }
  };

  /* ── Fetch ── */
  const loadDemandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PreinscriptionService.getAll();
      setDemandes(data);
    } catch {
      setError("Impossible de charger les demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDemandes(); }, []);

  /* ── Actions ── */
  const handleValidate = async () => {
    if (!selectedId) return;
    try {
      setActionLoading(true);
      await PreinscriptionService.validate(selectedId);
      setOpenValidate(false);
      setSelectedId(null);
      await loadDemandes();
    } catch {
      alert("Erreur validation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      setActionLoading(true);
      await PreinscriptionService.reject(selectedId);
      setOpenReject(false);
      setSelectedId(null);
      await loadDemandes();
    } catch {
      alert("Erreur rejet");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filter ── */
  const filtered = useMemo(() => {
    return demandes.filter(d => {
      const matchSearch =
        d.nom.toLowerCase().includes(searchQuery.toLowerCase())      ||
        d.prenom.toLowerCase().includes(searchQuery.toLowerCase())   ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase())    ||
        d.formation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatut = filterStatut === "TOUS" || d.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [demandes, searchQuery, filterStatut]);

  const countEnAttente = demandes.filter(d => d.statut === "EN_ATTENTE").length;
  const countValidees  = demandes.filter(d => d.statut === "VALIDEE").length;
  const countRejetees  = demandes.filter(d => d.statut === "REJETEE").length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipboardList className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Chargement des préinscriptions...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-red-100 p-10 text-center max-w-md mx-auto space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={loadDemandes}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCw size={15} />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── UI ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Préinscriptions
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#00A4E0]" />
                  {demandes.length} demande{demandes.length > 1 ? "s" : ""} au total
                </p>
              </div>
            </div>
            <button onClick={loadDemandes}
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                         border border-gray-200 bg-white hover:border-[#00A4E0] hover:text-[#00A4E0]
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">
              <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500" />
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"      value={demandes.length} color="bg-blue-400"  icon={Users} />
        <StatCard label="En attente" value={countEnAttente}  color="bg-amber-400" icon={Clock} />
        <StatCard label="Validées"   value={countValidees}   color="bg-green-400" icon={CheckCircle} />
        <StatCard label="Rejetées"   value={countRejetees}   color="bg-red-400"   icon={XCircle} />
      </div>

      {/* Search + Filter */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, formation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all bg-white/50 text-sm"
            />
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 flex-shrink-0 overflow-x-auto">
            {(["TOUS", "EN_ATTENTE", "VALIDEE", "REJETEE"] as const).map(s => {
              const labels = { TOUS: "Tous", EN_ATTENTE: "En attente", VALIDEE: "Validées", REJETEE: "Rejetées" };
              return (
                <button key={s} onClick={() => setFilterStatut(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    filterStatut === s
                      ? "bg-white shadow-sm text-[#00A4E0]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  {labels[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center space-y-4 border border-gray-100 shadow-lg">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
              <InboxIcon className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">Aucune demande trouvée</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Les demandes apparaîtront ici."}
            </p>
          </div>
        </div>
      )}

      {/* ===== DESKTOP : TABLEAU (lg et plus) ===== */}
      {filtered.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Candidat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Formation</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date de demande</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date d'action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d, index) => (
                  <tr key={d.id}
                    className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                    style={{ animation: `fadeIn 0.3s ease-out ${index * 0.04}s both` }}>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-white text-xs font-bold">{d.nom.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-[#00A4E0] transition-colors">
                            {d.nom} {d.prenom}
                          </p>
                          <p className="text-xs text-gray-500">{d.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-medium">{d.formation}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</span>
                    </td>

                    <td className="px-6 py-4">
                      {d.statut === "VALIDEE" && d.validatedAt ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium whitespace-nowrap">
                          <CalendarCheck size={14} className="text-green-500" />
                          {formatDate(d.validatedAt)}
                        </span>
                      ) : d.statut === "REJETEE" && d.rejectedAt ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-red-700 font-medium whitespace-nowrap">
                          <CalendarX size={14} className="text-red-500" />
                          {formatDate(d.rejectedAt)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatutBadge statut={d.statut} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() => { setSelectedId(d.id); setOpenDetails(true); }}
                          className="p-2 rounded-xl text-gray-500 hover:text-[#00A4E0] hover:bg-blue-50
                                     transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Voir les détails">
                          <Eye size={16} />
                        </button>

                        {d.statut === "EN_ATTENTE" && (
                          <>
                            <button
                              onClick={() => { setSelectedId(d.id); setOpenValidate(true); }}
                              className="p-2 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50
                                         transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Valider">
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedId(d.id); setOpenReject(true); }}
                              className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50
                                         transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Rejeter">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {/* ✅ PDF — via API_CONFIG */}
                        {d.statut === "VALIDEE" && d.pdfUrl && (
                          <button
                            onClick={() => downloadPdfSecure(d.id, d.nom, d.prenom)}
                            className="p-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50
                                       transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Télécharger PDF">
                            <FileText size={16} />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MOBILE / TABLETTE : CARTES (moins de lg) ===== */}
      {filtered.length > 0 && (
        <div className="lg:hidden space-y-3">
          {filtered.map((d, index) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 space-y-3"
              style={{ animation: `fadeIn 0.3s ease-out ${index * 0.04}s both` }}
            >
              {/* Ligne 1 : avatar + nom + statut */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white text-sm font-bold">{d.nom.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{d.nom} {d.prenom}</p>
                    <p className="text-xs text-gray-500 truncate">{d.email}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <StatutBadge statut={d.statut} />
                </div>
              </div>

              {/* Ligne 2 : formation + dates */}
              <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Formation</p>
                  <p className="font-medium text-gray-700 truncate">{d.formation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date de demande</p>
                  <p className="font-medium text-gray-700">{formatDate(d.createdAt)}</p>
                </div>
              </div>

              {d.statut === "VALIDEE" && d.validatedAt && (
                <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                  <CalendarCheck size={14} className="text-green-500" />
                  Validée le {formatDate(d.validatedAt)}
                </div>
              )}
              {d.statut === "REJETEE" && d.rejectedAt && (
                <div className="flex items-center gap-1.5 text-sm text-red-700 font-medium">
                  <CalendarX size={14} className="text-red-500" />
                  Rejetée le {formatDate(d.rejectedAt)}
                </div>
              )}

              {/* Ligne 3 : actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => { setSelectedId(d.id); setOpenDetails(true); }}
                  className="p-2 rounded-xl text-gray-500 hover:text-[#00A4E0] hover:bg-blue-50
                             transition-all duration-200 active:scale-95"
                  title="Voir les détails">
                  <Eye size={16} />
                </button>

                {d.statut === "EN_ATTENTE" && (
                  <>
                    <button
                      onClick={() => { setSelectedId(d.id); setOpenValidate(true); }}
                      className="p-2 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50
                                 transition-all duration-200 active:scale-95"
                      title="Valider">
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => { setSelectedId(d.id); setOpenReject(true); }}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50
                                 transition-all duration-200 active:scale-95"
                      title="Rejeter">
                      <XCircle size={16} />
                    </button>
                  </>
                )}

                {d.statut === "VALIDEE" && d.pdfUrl && (
                  <button
                    onClick={() => downloadPdfSecure(d.id, d.nom, d.prenom)}
                    className="p-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50
                               transition-all duration-200 active:scale-95"
                    title="Télécharger PDF">
                    <FileText size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <PreinscriptionDetailsModal
        open={openDetails}
        demandeId={selectedId}
        onClose={() => setOpenDetails(false)}
      />

      <ConfirmActionModal
        open={openValidate}
        loading={actionLoading}
        title="Valider la demande"
        message="Confirmer la validation de cette préinscription ?"
        confirmLabel="Valider"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        icon={<CheckCircle size={28} className="text-green-600" />}
        iconBg="bg-green-100"
        onConfirm={handleValidate}
        onCancel={() => setOpenValidate(false)}
      />

      <ConfirmActionModal
        open={openReject}
        loading={actionLoading}
        title="Rejeter la demande"
        message="Confirmer le rejet de cette préinscription ?"
        confirmLabel="Rejeter"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<XCircle size={28} className="text-red-600" />}
        iconBg="bg-red-100"
        onConfirm={handleReject}
        onCancel={() => setOpenReject(false)}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PreinscriptionsAdminPage;