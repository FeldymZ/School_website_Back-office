"use client"

import { useEffect, useState } from "react"
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Eye,
  RotateCcw,
  Banknote,
  Calendar,
  Clock,
  User,
} from "lucide-react"

import { DemandeDevisContinue } from "@/types/demande-devis-continue"
import { PageResponse } from "@/types/formation-continue"

import RepondreDemandeDevisModal from "@/components/devis/RepondreDemandeDevisModal"
import DetailDemandeDevisModal from "@/components/devis/DetailDemandeDevisModal"
import { StatutDemande } from "@/components/common/StatutBadge"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"

/* ================= STATUT CONFIG ================= */
const STATUT_CONFIG: Record<StatutDemande, {
  label: string
  dot: string
  bg: string
  text: string
  border: string
}> = {
  PAS_ENCORE_TRAITEE: {
    label: "En attente",
    dot: "bg-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
  },
  EN_COURS: {
    label: "En cours",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-[#00A4E0]",
    border: "border-blue-100",
  },
  FERMEE: {
    label: "Traitée",
    dot: "bg-green-400",
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-100",
  },
}

const FILTER_OPTIONS = [
  { value: "ALL",                 label: "Toutes" },
  { value: "PAS_ENCORE_TRAITEE", label: "En attente" },
  { value: "EN_COURS",           label: "En cours" },
  { value: "FERMEE",             label: "Traitées" },
] as const

/* ================= FORMAT DATE ================= */
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric"
  }) : "—"

const formatHeure = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit"
  }) : "—"

/* ================= PAGE ================= */
export default function DemandesDevisContinuesPage() {

  const [demandes, setDemandes]         = useState<DemandeDevisContinue[]>([])
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(0)
  const [searchQuery, setSearchQuery]   = useState("")
  const [filterStatut, setFilterStatut] =
    useState<"ALL" | "PAS_ENCORE_TRAITEE" | "EN_COURS" | "FERMEE">("ALL")

  const [selectedDemande, setSelectedDemande] = useState<DemandeDevisContinue | null>(null)
  const [repondreOpen, setRepondreOpen]       = useState(false)
  const [detailOpen, setDetailOpen]           = useState(false)

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

  /* ================= FILTER ================= */
  const filteredDemandes = demandes.filter((d) => {
    const matchSearch =
      d.nomClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatut = filterStatut === "ALL" || d.statut === filterStatut
    return matchSearch && matchStatut
  })

  /* ================= MONTANT — même logique que DetailDemandeDevisModal ================= */
  const computeMontant = (d: DemandeDevisContinue) => {
    if ((d as any).montantTotal) return (d as any).montantTotal

    return d.lignes?.reduce(
      (sum, l) => sum + (l.prix ?? 0) * l.nombreParticipants,
      0
    )
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-6 animate-pulse">
          <div className="h-28 bg-white rounded-3xl border border-gray-100" />
          <div className="h-16 bg-white rounded-2xl border border-gray-100" />
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                    <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                  </div>
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
      <div className="w-full space-y-6 animate-in fade-in duration-500">

        {/* ===== HEADER ===== */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                    <ClipboardList className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Demandes de devis
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#00A4E0]" />
                    {demandes.length} demande{demandes.length > 1 ? "s" : ""} au total
                  </p>
                </div>
              </div>

              {/* COMPTEURS STATUTS */}
              <div className="flex items-center gap-3 flex-wrap">
                {(["PAS_ENCORE_TRAITEE", "EN_COURS", "FERMEE"] as const).map((s) => {
                  const count = demandes.filter(d => d.statut === s).length
                  const cfg = STATUT_CONFIG[s]
                  return (
                    <div key={s} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                      <span className={`text-xs font-black ${cfg.text}`}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEARCH + FILTRES ===== */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">

            {/* SEARCH */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors" size={16} />
              <input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0]
                           text-sm transition-all bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>

            {/* FILTRES STATUT */}
            <div className="flex items-center gap-2 flex-wrap">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatut(opt.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filterStatut === opt.value
                      ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-md shadow-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== EMPTY ===== */}
        {filteredDemandes.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center space-y-4 border border-gray-100 shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Aucune demande trouvée</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : "Il n'y a aucune demande pour ce filtre."}
            </p>
          </div>
        )}

        {/* ===== TABLE ===== */}
        {filteredDemandes.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left   text-xs font-black text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left   text-xs font-black text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left   text-xs font-black text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDemandes.map((d, index) => {
                    const montant  = computeMontant(d)
                    const cfg      = STATUT_CONFIG[d.statut]
                    const isFermee = d.statut === "FERMEE"
                    const dateStr  = formatDate((d as any).dateDemande)
                    const heureStr = formatHeure((d as any).dateDemande)

                    return (
                      <tr
                        key={d.id}
                        className="group hover:bg-blue-50/30 transition-all duration-200"
                        style={{ animation: `fadeIn 0.3s ease-out ${index * 0.04}s both` }}
                      >
                        {/* ID */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-mono font-bold">
                            #{d.id}
                          </span>
                        </td>

                        {/* DATE + HEURE */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700 font-semibold">
                              <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                              {dateStr}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Clock size={11} className="flex-shrink-0" />
                              {heureStr}
                            </div>
                          </div>
                        </td>

                        {/* CLIENT */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A4E0]/10 to-indigo-100
                                            flex items-center justify-center flex-shrink-0">
                              <User size={14} className="text-[#00A4E0]" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm group-hover:text-[#00A4E0] transition-colors">
                                {d.nomClient}
                              </p>
                              <p className="text-xs text-gray-400">{d.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* MONTANT */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Banknote size={14} className="text-[#00A4E0]" />
                            <span className="font-black text-[#00A4E0] text-sm">
                              {montant ? montant.toLocaleString() : "0"} FCFA
                            </span>
                          </div>
                        </td>

                        {/* STATUT */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl
                                            text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedDemande(d); setDetailOpen(true) }}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-[#00A4E0] hover:bg-blue-50
                                         transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Voir les détails"
                            >
                              <Eye size={16} />
                            </button>
                            {!isFermee && (
                              <button
                                onClick={() => { setSelectedDemande(d); setRepondreOpen(true) }}
                                className="p-2.5 rounded-xl text-gray-400 hover:text-white
                                           hover:bg-gradient-to-r hover:from-[#00A4E0] hover:to-[#0077A8]
                                           transition-all duration-200 hover:scale-110 active:scale-95"
                                title="Répondre"
                              >
                                <MessageSquare size={16} />
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

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="font-bold text-gray-900">{page + 1}</span> sur {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
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
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                    page === i
                      ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-md shadow-blue-200"
                      : "border border-gray-200 text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
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

      {/* ===== MODALS ===== */}
      <RepondreDemandeDevisModal
        demande={selectedDemande}
        isOpen={repondreOpen}
        onClose={() => setRepondreOpen(false)}
        onSuccess={loadDemandes}
      />
      <DetailDemandeDevisModal
        demande={selectedDemande}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}