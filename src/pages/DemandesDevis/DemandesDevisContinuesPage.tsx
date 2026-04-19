import { useEffect, useState } from "react"
import {
  CheckCircle,
  AlertCircle,
  ClipboardList,
  Users,
  Timer,
  Search,
  InboxIcon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Eye,
  Loader,
} from "lucide-react"

import { DemandeDevisContinue } from "@/types/demande-devis-continue"
import { PageResponse } from "@/types/formation-continue"

import RepondreDemandeDevisModal from "@/components/devis/RepondreDemandeDevisModal"
import DetailDemandeDevisModal from "@/components/devis/DetailDemandeDevisModal"
import { StatutDemande } from "@/components/common/StatutBadge"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"

/* ============================ STATUT CONFIG ============================ */

const STATUT_CONFIG: Record<StatutDemande, {
  label: string
  bg: string
  text: string
  dot: string
  pulse: boolean
}> = {
  PAS_ENCORE_TRAITEE: {
    label: "En attente",
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-400",
    pulse: true,
  },
  EN_COURS: {
    label: "En cours",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
    pulse: true,
  },
  FERMEE: {
    label: "Traitée",
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-400",
    pulse: false,
  },
}

/* ============================ STAT CARD ============================ */

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  glow: string
}

const StatCard = ({ label, value, icon: Icon, gradient, glow }: StatCardProps) => (
  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
    <div className={`absolute -right-4 -top-4 w-20 h-20 ${glow} rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`} />
    <div className="relative flex items-center gap-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  </div>
)

/* ============================ PAGE ============================ */

const DemandesDevisContinuesPage = () => {
  const [demandes, setDemandes] = useState<DemandeDevisContinue[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  /* 🔥 FIX FILTER — 3 statuts */
  const [filterStatut, setFilterStatut] =
    useState<"ALL" | "PAS_ENCORE_TRAITEE" | "EN_COURS" | "FERMEE">("ALL")

  const [selectedDemande, setSelectedDemande] =
    useState<DemandeDevisContinue | null>(null)
  const [repondreOpen, setRepondreOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ================= LOAD ================= */

  const loadDemandes = async () => {
    try {
      setLoading(true)
      const data: PageResponse<DemandeDevisContinue> =
        await DemandeDevisContinuesService.getAll(page, 10)
      setDemandes(data.content)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDemandes() }, [page])

  /* ================= ACTIONS ================= */

  const openRepondre = (demande: DemandeDevisContinue) => {
    setSelectedDemande(demande)
    setRepondreOpen(true)
  }

  const openDetail = (demande: DemandeDevisContinue) => {
    setSelectedDemande(demande)
    setDetailOpen(true)
  }

  /* ================= FILTER ================= */

  const filteredDemandes = demandes.filter((d) => {
    const matchSearch =
      d.nomClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatut = filterStatut === "ALL" || d.statut === filterStatut
    return matchSearch && matchStatut
  })

  /* 🔥 FIX STATS — 3 statuts */
  const countEnAttente = demandes.filter((d) => d.statut === "PAS_ENCORE_TRAITEE").length
  const countEnCours   = demandes.filter((d) => d.statut === "EN_COURS").length
  const countFermees   = demandes.filter((d) => d.statut === "FERMEE").length

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl border animate-pulse" />)}
          </div>
          <div className="bg-white/80 rounded-2xl p-6 border">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-9 w-28 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="w-full space-y-8 animate-in fade-in duration-500">

        {/* HEADER */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Demandes de devis
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00A4E0]" />
                  {demandes.length} demande{demandes.length > 1 ? "s" : ""} au total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS — 3 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="En attente"
            value={countEnAttente}
            icon={AlertCircle}
            gradient="from-orange-400 to-amber-500"
            glow="bg-orange-400"
          />
          <StatCard
            label="En cours"
            value={countEnCours}
            icon={Loader}
            gradient="from-[#00A4E0] to-[#0077A8]"
            glow="bg-blue-400"
          />
          <StatCard
            label="Clôturées"
            value={countFermees}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-600"
            glow="bg-green-400"
          />
        </div>

        {/* SEARCH + FILTERS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all bg-white/50"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 flex-wrap gap-1">
              {(["ALL", "PAS_ENCORE_TRAITEE", "EN_COURS", "FERMEE"] as const).map((s) => {
                const labels = {
                  ALL: "Toutes",
                  PAS_ENCORE_TRAITEE: "En attente",
                  EN_COURS: "En cours",
                  FERMEE: "Clôturées",
                }
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatut(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filterStatut === s
                        ? "bg-white shadow-sm text-[#00A4E0]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {labels[s]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {filteredDemandes.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center space-y-6 border border-gray-100 shadow-xl">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <InboxIcon className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl opacity-20 blur-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {searchQuery ? "Aucun résultat trouvé" : "Aucune demande disponible"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery
                  ? `Aucune demande ne correspond à "${searchQuery}"`
                  : "Les demandes de devis apparaîtront ici."}
              </p>
            </div>
          </div>
        )}

        {/* TABLE */}
        {filteredDemandes.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left   text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Participants</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Durée</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right  text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDemandes.map((d, index) => {
                    const cfg = STATUT_CONFIG[d.statut as keyof typeof STATUT_CONFIG] ?? {
  label: d.statut,
  bg: "bg-gray-100",
  text: "text-gray-600",
  dot: "bg-gray-400",
  pulse: false,
}
                    const isFermee = d.statut === "FERMEE"  /* 🔥 FIX BOUTON */
                    console.log("STATUT BACK:", d.statut)
                    return (
                      <tr
                        key={d.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 align-middle"
                        style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                      >
                        {/* CLIENT */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {d.nomClient.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-[#00A4E0] transition-colors">{d.nomClient}</p>
                              <p className="text-sm text-gray-500">{d.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* PARTICIPANTS */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex flex-col items-center gap-1">
                            {d.lignes.map((l, i) => (
                              <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
                                <Users size={14} />
                                {l.nombreParticipants}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* DURÉE */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex flex-col items-center gap-1">
                            {d.lignes.map((l, i) => (
                              <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-sm font-medium">
                                <Timer size={14} />
                                {l.duree} {l.uniteDuree}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* STATUT */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex justify-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.text} text-sm font-medium`}>
                              {cfg.pulse
                                ? <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                                : <CheckCircle size={13} />
                              }
                              {cfg.label}
                            </div>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center justify-end gap-2">

                            {/* Détail — toujours visible */}
                            <button
                              onClick={() => openDetail(d)}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm
                                         text-gray-600 bg-gray-100 border border-gray-200
                                         hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-200"
                              title="Voir le détail"
                            >
                              <Eye size={15} />
                              Détail
                            </button>

                            {/* 🔥 FIX BOUTON — visible si pas FERMEE */}
                            {!isFermee && (
                              <button
                                onClick={() => openRepondre(d)}
                                className="group/btn relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white overflow-hidden
                                           hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                <span className="relative flex items-center gap-2">
                                  <MessageSquare size={15} />
                                  Répondre
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-900">{page + 1}</span> sur {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:border-[#00A4E0] hover:text-[#00A4E0]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    page === i
                      ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-md shadow-blue-200"
                      : "border border-gray-200 text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:border-[#00A4E0] hover:text-[#00A4E0]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODALE RÉPONDRE */}
      <RepondreDemandeDevisModal
        demande={selectedDemande}
        isOpen={repondreOpen}
        onClose={() => setRepondreOpen(false)}
        onSuccess={() => {
          loadDemandes()
          setRepondreOpen(false)
          showToast("Réponse envoyée", "success")
        }}
        onError={(msg) => showToast(msg, "error")}
      />

      {/* MODALE DÉTAIL */}
      <DetailDemandeDevisModal
        demande={selectedDemande}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* Toast global */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border
                      animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "error"
              ? "bg-red-50 border-red-100 text-red-700"
              : "bg-white border-gray-100 text-gray-800"
          }`}
        >
          {toast.type === "error"
            ? <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            : <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          }
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

export default DemandesDevisContinuesPage