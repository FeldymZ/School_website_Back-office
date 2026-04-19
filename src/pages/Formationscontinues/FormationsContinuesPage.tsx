"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  XCircle,
  InboxIcon,
} from "lucide-react"

import { FormationContinue, PageResponse } from "@/types/formation-continue"
import { resolveImageUrl } from "@/utils/image"
import { FormationContinueService } from "@/services/FormationContinueService"
import { CatalogueAdminService } from "@/services/CatalogueAdminService"

import FormationContinueCreateModal from "@/components/formations-continues/FormationContinueCreateModal"
import FormationContinueEditModal from "@/components/formations-continues/FormationContinueEditModal"
import FormationContinueDetailsModal from "@/components/formations-continues/FormationContinueDetailsModal"

/* ================= TYPES ================= */

interface Categorie {
  id: number
  libelle: string
}

type ModalState =
  | { type: "create" }
  | { type: "edit"; id: number }
  | { type: "details"; id: number }
  | null

/* ================= COMPONENT ================= */

const FormationsContinuesPage = () => {

  const [formations, setFormations] = useState<FormationContinue[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchRef, setSearchRef] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  const [modal, setModal] = useState<ModalState>(null)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* ================= LOAD FORMATIONS ================= */
  const loadFormations = async () => {
    try {
      setLoading(true)
      const data: PageResponse<FormationContinue> =
        await FormationContinueService.getAll(page, 10)
      setFormations(data.content)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error("Erreur chargement formations", err)
      setFormations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFormations() }, [page])

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CatalogueAdminService.getCategories()
        setCategories(data)
      } catch (e) {
        console.error("Erreur categories", e)
      }
    }
    loadCategories()
  }, [])

  /* ================= HELPER ================= */
  const getCategorieName = (categorieId?: number) => {
    if (!categorieId) return null
    return categories.find(c => c.id === categorieId)?.libelle
  }

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    if (!searchRef.trim()) return
    try {
      setSearchLoading(true)
      const formation = await FormationContinueService.getByReference(Number(searchRef))
      setFormations([formation])
      setTotalPages(1)
    } catch (err) {
      console.error("Erreur recherche", err)
      setFormations([])
    } finally {
      setSearchLoading(false)
    }
  }

  const resetSearch = () => {
    setSearchRef("")
    loadFormations()
  }

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleting(true)
      await FormationContinueService.delete(deleteId)
      setDeleteId(null)
      await loadFormations()
    } catch (err) {
      console.error("Erreur suppression", err)
    } finally {
      setDeleting(false)
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-44 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="bg-white/80 rounded-2xl p-6 border">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
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
      <div className="w-full space-y-8 animate-in fade-in duration-500">

        {/* ===== HEADER ===== */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Formations Continues
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-[#00A4E0]" />
                    {formations.length} formation{formations.length > 1 ? "s" : ""} disponible{formations.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModal({ type: "create" })}
                className="group relative px-6 py-3 rounded-xl font-medium text-white overflow-hidden
                           hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  <Plus size={20} />
                  Ajouter
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== SEARCH ===== */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors" />
              <input
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher par référence (ex: 5234)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all bg-white/50"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="group relative px-5 py-3 rounded-xl font-medium text-white overflow-hidden
                           hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  {searchLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Search size={16} />
                  }
                  Rechercher
                </span>
              </button>
              <button
                onClick={resetSearch}
                title="Réinitialiser"
                className="p-3 rounded-xl border border-gray-200 text-gray-600
                           hover:border-gray-300 hover:bg-gray-50
                           hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ===== EMPTY STATE ===== */}
        {formations.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center space-y-6 border border-gray-100 shadow-xl">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl opacity-20 blur-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {searchRef ? "Aucun résultat trouvé" : "Aucune formation disponible"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchRef
                  ? `Aucune formation ne correspond à "${searchRef}"`
                  : "Commencez par créer votre première formation continue."}
              </p>
            </div>
            {!searchRef && (
              <button
                onClick={() => setModal({ type: "create" })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white
                           hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Créer ma première formation
              </button>
            )}
          </div>
        )}

        {/* ===== TABLE ===== */}
        {formations.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Formation</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sous-catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formations.map((f, index) => (
                    <tr
                      key={f.id}
                      className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                      style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      {/* FORMATION */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                            <img
                              src={resolveImageUrl(f.coverUrl)}
                              alt={f.libelle}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="font-bold text-gray-900 group-hover:text-[#00A4E0] transition-colors">
                            {f.libelle}
                          </p>
                        </div>
                      </td>

                      {/* CATEGORIE */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getCategorieName(f.sousCategorie?.categorieId) || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* SOUS-CATEGORIE */}
                      <td className="px-6 py-4">
                        {f.sousCategorie ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            <Tag size={11} />
                            {f.sousCategorie.libelle}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      {/* REFERENCE */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-mono font-semibold">
                          #{f.reference}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setModal({ type: "details", id: f.id })}
                            className="p-2.5 rounded-xl text-gray-600 hover:text-[#00A4E0]
                                       hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Voir les détails"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => setModal({ type: "edit", id: f.id })}
                            className="p-2.5 rounded-xl text-gray-600 hover:text-green-600
                                       hover:bg-green-50 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Modifier"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => setDeleteId(f.id)}
                            className="p-2.5 rounded-xl text-gray-600 hover:text-red-600
                                       hover:bg-red-50 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Supprimer"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-900">{page + 1}</span> sur {totalPages}
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
                onClick={() => setPage(p => p + 1)}
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

      {/* ===== MODAL DELETE ===== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden
                       animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              />
              <div className="relative px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/30">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Confirmer la suppression</h2>
                    <p className="text-white/60 text-xs mt-0.5">Cette action est irréversible</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
                >
                  <XCircle size={15} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                Voulez-vous vraiment supprimer cette formation ? Toutes les données associées seront perdues.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                             hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600
                             text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98] transition-all duration-200
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Suppression...
                    </span>
                  ) : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      <FormationContinueCreateModal
        open={modal?.type === "create"}
        onClose={() => setModal(null)}
        onSuccess={loadFormations}
      />
      <FormationContinueEditModal
        formationId={modal?.type === "edit" ? modal.id : null}
        open={modal?.type === "edit"}
        onClose={() => setModal(null)}
        onSuccess={loadFormations}
      />
      <FormationContinueDetailsModal
        formationId={modal?.type === "details" ? modal.id : null}
        open={modal?.type === "details"}
        onClose={() => setModal(null)}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

export default FormationsContinuesPage